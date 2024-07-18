import Image from "next/image";
import { whatsappLink } from "./whatsapp";

export interface WhatsAppLinkProps {
    phoneNr: string;
}
export default function WhatsAppLinkComp({phoneNr}: WhatsAppLinkProps) {
    return (
        <a href={whatsappLink(phoneNr, '')} target="blank"><Image src='/WhatsApp/Print_Stacked_Green.png' alt='WhatsApp' width={50} height={32}/></a>
    )
}