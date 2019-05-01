class gameSocket {
    constructor(url) {
        this.url = url;
        this.socket = null;

    }

    connect() {
        return new Promise((resolve, reject) => {
            var server = new WebSocket(this.url);
            server.onopen = function () {
                resolve(server);
            };
            server.onerror = function (err) {
                reject(err);
            };

        });
    }


    validateServerGameSocketMessage(data) {
        if (data.actors) {

            return true;
        }


        return false;

    }

    async registerEvent() {
        try {
            this.socket = await this.connect();


            this.socket.onopen = function (event) {
                //$('#sendButton').removeAttr('disabled');
                console.log("CLIENT: connected");
            };
            this.socket.onclose = function (event) {
                alert("Unable to connect to game server, try again later.");
            };
            this.socket.onmessage = (event) => {

                try {
                    var message = JSON.parse(event.data);
                } catch (e) {
                }
                if (!this.validateServerGameSocketMessage(message)) {
                    console.log("validateServerGameSocketMessage error");
                    return;
                }

                if (this.game && this.currentUser) {
                    this.game.world.clearWorld();
                    this.game.world.addServerActors(message.actors, this.currentUser.info.userid);
                }
            }
        } catch (error) {
            console.log("oops ", error)
        }
    }

    send(operation, userid, dummyevent) {

        let jso = {
            'operation': operation,
            'userid': userid,
            'event': dummyevent
        };

        let json = JSON.stringify(jso);
        this.socket.send(json);
    }
}

export default gameSocket;