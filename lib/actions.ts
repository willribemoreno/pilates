import { OWNER_INFOS } from './constants';
import { redirect } from 'next/navigation'

export type State = string | null;

export async function createWhatsAppLink(phoneNumber: string, message: string) {
    const baseUrl = 'https://whatsa.me/';
    const encodedMessage = encodeURIComponent(message);
    const finalUrl = `${baseUrl}${phoneNumber}/?t=${encodedMessage}`;
    return finalUrl;
}

export async function createCustomWhatsAppLink(data: FormData) {

    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');
    const number = OWNER_INFOS.phoneNumber;

    const finalMessage = `Nome: ${name}.\nMensagem: ${message}\nE-mail: ${email}`;
    const finalUrl = createWhatsAppLink(number, finalMessage);

    return finalUrl;
}

export async function redirectToWhatsApp(prevState: State, data: FormData): Promise<string | null> {
    const url = await createCustomWhatsAppLink(data);

    if (url) {
        window.open(url, "_blank"); // Open the URL in a new tab
    }
    redirect('#contact');

    return url;
}