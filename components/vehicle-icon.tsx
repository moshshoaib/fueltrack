import { HugeiconsIcon } from "@hugeicons/react"
import {
    Car01Icon,
    Motorbike01Icon,
    DeliveryTruck01Icon,
    Bus01Icon,
    Scooter01Icon,
} from "@hugeicons/core-free-icons"

export const vehicleIcons = [
    { id: "car", icon: Car01Icon, label: "Car" },
    { id: "motorcycle", icon: Motorbike01Icon, label: "Motorcycle" },
    { id: "truck", icon: DeliveryTruck01Icon, label: "Truck" },
    { id: "bus", icon: Bus01Icon, label: "Bus" },
    { id: "scooter", icon: Scooter01Icon, label: "Scooter" },
]

export function getVehicleIcon(id: string | null | undefined) {
    const found = vehicleIcons.find((v) => v.id === id)
    return found ? found.icon : Car01Icon
}
