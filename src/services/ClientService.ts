import { Client, Room } from "colyseus";

//message types have to include SendMessage
type EnumWithSendMessage<T> = T & { SendMessage: 0 };

export class ClientService<M> {

    private room: Room;
    private clientHandlers = new Map<number, (client: Client, msg: any) => void>();
    private msgs = { SendMessage: 0 } as EnumWithSendMessage<M>;

    constructor(room: Room) {
        this.room = room;

        this.room.onMessage(this.msgs.SendMessage, (client, data) => {
    
            const handler = this.clientHandlers.get(data.type);
       
            if(handler) {
                handler(client, data);
            }
        });

    }

    send(msgType: number, data?: any, client?: Client) {

        if(client) {
            
            client.send(this.msgs.SendMessage, {
                type: msgType,
                ...data,
            });
            return;
        }
        else {
            this.room.broadcast(this.msgs.SendMessage, {
                type: msgType,
                ...data,
            });
        }
    }

    on(msgType: number, cb: (client: Client, data: any) => void, context?: any) {
        this.clientHandlers.set(msgType, cb);
    }
}