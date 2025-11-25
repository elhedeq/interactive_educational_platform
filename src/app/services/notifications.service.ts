import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class Notification {

    showNotification(msg:string, duration:number, type:string, prompt:boolean = false):void {
        let notification = document.createElement('p');
        notification.innerText = msg;
        notification.style.color = 'white';
        notification.style.fontWeight = 'bold';
        notification.classList.add(`bg-${type}`);
        notification.classList.add('p-5');
        notification.style.position = 'fixed';
        notification.style.bottom = '0';
        notification.style.right = '0';
        notification.style.transition = 'height ease-in 0.5s';
        document.getElementsByTagName('body')[0].appendChild(notification);
        if(!prompt) {
            setTimeout(() => {
                notification.style.height = '0';
                notification.style.visibility = 'hidden'
            }, duration);
        }
    }
}