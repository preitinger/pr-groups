import { useCallback } from "react"
import { CustomMenuItem } from "./Menu"

type  UseLogoutResult = CustomMenuItem[]

export default function useLogout(user: string | null, onMenuClick: () => void): UseLogoutResult {
    const menuItem: CustomMenuItem = {
        label: `${user} abmelden`,
        onClick: onMenuClick
    }
    return user == null ? [] : [
        menuItem
    ]
}