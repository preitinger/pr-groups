import { useCallback } from "react"
import { CustomMenuItem } from "./Menu"
import { userAndTokenFromStorages, userAndTokenToStorages } from "./userAndToken"
import { LogoutReq } from "./user-management-client/user-management-common/logout";
import { userLogoutFetch } from "./user-management-client/userManagementClient";


export default function userMenuItems(signal?: AbortSignal, afterLogout?: (error: string) => void): CustomMenuItem[] {
    const [user, token] = userAndTokenFromStorages();

    if (user != null && token != null) {
        const onMenuClick = () => {
            const req: LogoutReq = {
                user: user,
                token: token
            }
            userLogoutFetch(req, signal).then(resp => {
                switch (resp.type) {
                    case 'error':
                        if (afterLogout) afterLogout(resp.error);
                        break;
                    case 'wrongUserOrToken':
                        if (afterLogout) afterLogout('Du warst nicht mehr auf diesem Gerät eingeloggt!');
                        break;
                    case 'success':
                        if (afterLogout) afterLogout('');
                }
            }).finally(() => {
                userAndTokenToStorages(user, null);
            })
        }

        return user == null || token == null ? [] : [
            {
                label: `${user} abmelden`,
                onClick: onMenuClick
            }
        ]
    } else {
        return []
    }

}