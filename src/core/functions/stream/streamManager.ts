/* eslint-disable no-console */
/* eslint-disable prefer-promise-reject-errors */
import type { ChildProcessWithoutNullStreams } from "child_process"
import { spawn } from "child_process"
import fs from "fs"
import path from "path"

interface I_StreamOptions {
    username: string
    password: string
    ip: string
    brand: string
    channel?: number
}

const ffmpegProcesses = new Map<string, ChildProcessWithoutNullStreams>()

export const getRunningCameraStreams = () => Array.from(ffmpegProcesses.keys())

export const sanitize = (str: string): string => str.replace(/[^a-z0-9]/gi, "_").toLowerCase()
export const startStream = async (options: I_StreamOptions): Promise<string | null> => {
    const { username, password, ip, brand, channel = 1 } = options
    const cameraId = sanitize(`${username}_${ip}_ch${channel}`)

    // Return existing stream if already running
    if (ffmpegProcesses.has(cameraId)) return `/hls/${cameraId}/stream.m3u8`

    // Build RTSP URL based on camera brand
    let rtspUrl = ""
    if (brand.toLowerCase() === "hik_vision") {
        rtspUrl = `rtsp://${username}:${encodeURIComponent(password)}@${ip}:554/Streaming/Channels/${channel}`
    } else if (brand.toLowerCase() === "dahua") {
        rtspUrl = `rtsp://${username}:${encodeURIComponent(password)}@${ip}:554/cam/realmonitor?channel=${channel}&subtype=0&unicast=true&proto=Onvif`
    } else {
        return null
    }

    // Create output directory
    const outputDir = path.resolve(__dirname, "../../../..", "uploads", "hls", cameraId)
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = path.join(outputDir, "stream.m3u8")

    // Build FFmpeg arguments
    const ffmpegArgs = []

    // Dahua cameras need special parameters
    if (brand.toLowerCase() === "dahua") {
        ffmpegArgs.push(
            "-rtsp_transport",
            "tcp",
            "-max_delay",
            "500000",
            "-analyzeduration",
            "10000000",
            "-probesize",
            "10000000",
        )
    }

    // Common FFmpeg parameters for HLS streaming
    ffmpegArgs.push(
        "-i",
        rtspUrl,
        "-an", // No audio
        "-c:v",
        "copy", // Copy video codec (no re-encoding)
        "-fflags",
        "nobuffer",
        "-flags",
        "low_delay",
        "-tune",
        "zerolatency",
        "-hls_time",
        "0.5", // Half-second segments
        "-hls_list_size",
        "2", // Only 2 segments = 1 second buffer
        "-hls_flags",
        "delete_segments+omit_endlist+split_by_time",
        "-hls_segment_type",
        "mpegts",
        "-f",
        "hls",
        outputPath,
    )

    // Spawn FFmpeg process
    const ffmpeg = spawn("ffmpeg", ffmpegArgs)

    return new Promise((resolve, reject) => {
        let fileCheckInterval: NodeJS.Timeout | null = null
        let startupTimeout: NodeJS.Timeout | null = null
        let hasResolved = false

        // Function to clean up resources
        const cleanup = () => {
            if (fileCheckInterval) clearInterval(fileCheckInterval)
            if (startupTimeout) clearTimeout(startupTimeout)
        }

        // Poll for file creation every 100ms
        fileCheckInterval = setInterval(() => {
            if (fs.existsSync(outputPath)) {
                cleanup()
                hasResolved = true
                resolve(`/hls/${cameraId}/stream.m3u8`)
            }
        }, 100)

        // Timeout after 10 seconds if stream doesn't start
        startupTimeout = setTimeout(() => {
            if (!hasResolved) {
                cleanup()
                ffmpeg.kill("SIGINT")
                reject(new Error(`Stream startup timeout for camera ${cameraId}`))
            }
        }, 10000)

        // Log FFmpeg output (all FFmpeg logs go to stderr, even normal ones)
        ffmpeg.stderr.on("data", (data: Buffer) => {
            const output = data.toString()
            console.log(`[${cameraId}] ${output}`)
        })

        // Handle FFmpeg process exit
        ffmpeg.on("close", (code: number) => {
            cleanup()
            ffmpegProcesses.delete(cameraId)

            if (!hasResolved) {
                reject(new Error(`FFmpeg process exited with code ${code} for camera ${cameraId}`))
            }
        })

        // Store process reference
        ffmpegProcesses.set(cameraId, ffmpeg)
    })
}

export const stopStream = (ip: string): void => {
    for (const [cameraId, ffmpeg] of ffmpegProcesses.entries()) {
        if (cameraId.includes(sanitize(ip))) {
            ffmpeg.kill("SIGINT")
            ffmpegProcesses.delete(cameraId)
            break
        }
    }
}
