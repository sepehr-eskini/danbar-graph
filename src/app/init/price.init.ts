import type { CreatePriceRq } from "@database/entities"
import { Class, Price } from "@database/entities"

const DEFAULT_PRICES: CreatePriceRq[] = [
    { class_token: "", sessions_count: 1, price: 10000000 },
    { class_token: "", sessions_count: 4, price: 19000000 },
    { class_token: "", sessions_count: 8, price: 27000000 },
    { class_token: "", sessions_count: 12, price: 34000000 },
    { class_token: "", sessions_count: 16, price: 40000000 },
    { class_token: "", sessions_count: 20, price: 45000000 },
    { class_token: "", sessions_count: 1, price: 10000000 },
    { class_token: "", sessions_count: 4, price: 19000000 },
    { class_token: "", sessions_count: 8, price: 27000000 },
    { class_token: "", sessions_count: 12, price: 34000000 },
    { class_token: "", sessions_count: 16, price: 40000000 },
    { class_token: "", sessions_count: 20, price: 45000000 },
    { class_token: "", sessions_count: 1, price: 10000000 },
    { class_token: "", sessions_count: 4, price: 19000000 },
    { class_token: "", sessions_count: 8, price: 27000000 },
    { class_token: "", sessions_count: 12, price: 34000000 },
    { class_token: "", sessions_count: 16, price: 40000000 },
    { class_token: "", sessions_count: 20, price: 45000000 },
    { class_token: "", sessions_count: 1, price: 10000000 },
    { class_token: "", sessions_count: 4, price: 19000000 },
    { class_token: "", sessions_count: 8, price: 27000000 },
    { class_token: "", sessions_count: 12, price: 34000000 },
    { class_token: "", sessions_count: 16, price: 40000000 },
    { class_token: "", sessions_count: 20, price: 45000000 },
    { class_token: "", sessions_count: 1, price: 10000000 },
    { class_token: "", sessions_count: 4, price: 19000000 },
    { class_token: "", sessions_count: 8, price: 27000000 },
    { class_token: "", sessions_count: 12, price: 34000000 },
    { class_token: "", sessions_count: 16, price: 40000000 },
    { class_token: "", sessions_count: 20, price: 45000000 },
    { class_token: "", sessions_count: 1, price: 10000000 },
    { class_token: "", sessions_count: 4, price: 19000000 },
    { class_token: "", sessions_count: 8, price: 27000000 },
    { class_token: "", sessions_count: 12, price: 34000000 },
    { class_token: "", sessions_count: 16, price: 40000000 },
    { class_token: "", sessions_count: 20, price: 45000000 },
]

export const initPrice = async () => {
    const priceCount = await Price.count({})

    if (priceCount === 0) {
        const classes = await Class.find()

        const prices = DEFAULT_PRICES.map((price, index) => ({
            ...price,
            class_token: classes[Math.floor(index / 6)].token,
            admin_token: "system_initialization",
        }))

        await Price.insert(prices)
    }
}
