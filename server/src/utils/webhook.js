import axios from "axios";

const webhook = async (message) => {
    try {
        const webhookUrl = "https://telexphi.webhook.office.com/webhookb2/8642a7bd-d30e-471a-ab93-961c5c811e1b@9c6525b8-2492-4c6b-97ef-842f265bce91/IncomingWebhook/342adfb78c344c0c870b58cbcd01caab/f43a1ccd-30a1-48d8-b0af-b924d1b02eba/V2JRm5YtBHhjK_oaxS_9-ZJuLBQOJNjgAPcRCpKIsNphQ1";
        await axios.post(webhookUrl, { text: message })
    } catch (error) {
        console.error(error);
    }
}

export default webhook;