import React, {Component} from 'react';
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import MainGame from "./components/MainGame";
import Profile from "./components/Profile";
import Snackbar from '@material-ui/core/Snackbar';
import MySnackbarContentWrapper from "./components/SnackBar";
import gameSocket from "./socket";


import axios from 'axios';
import Game from "./model";

class User {
    constructor() {
        this.info = {
            userid: null,
            username: null,
            password: null,
            gender: null,
            birthday: null
        };

        this.achievement = {
            kill: 0,
            damage: 0
        }
    }

    setInfo(data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                this.info[key] = data[key];
            }
        }

    }

    setAchievement(data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                this.achievement[key] = data[key];
            }
        }


    }

    setUserid(userid) {
        this.info.userid = userid;
    }

    setPassword(password) {
        this.info.password = password;
    }

    clear() {
        this.info = {
            userid: null,
            username: null,
            password: null,
            gender: null,
            birthday: null
        };
        this.achievement = {
            kill: 0,
            damage: 0
        }
    }
}


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            state: "login",
            error: false,
            errorMessage: "",
            info: false,
            infoMessage: "",
        };

        this.currentUser = new User();

        //document.location.host);      // localhost:1234
        let ip = document.location.hostname;  // localhost
        let port = document.location.port;  // 1234

        if (!port) {
            port = "80";
        }
        console.log("ws://" + ip + ":" + (port + 1));
        //this.clientGameSocket = new gameSocket("ws://142.1.200.147:10940/");
        //this.clientGameSocket = new gameSocket("ws://localhost:10940/");
        this.clientGameSocket = new gameSocket("ws://" + ip + ":" + (parseInt(port, 10) + 1));

        this.clientGameSocket.registerEvent().then(() => {
            console.log("CLIENT: client socket open");
        });

        this.game = new Game(document.getElementById('stage'), this.currentUser, this.clientGameSocket);
        this.game.setPlayerEventListener();
        this.game.step();
        this.game.draw();
        this.game.start();

        this.clientGameSocket.game = this.game;
        this.clientGameSocket.currentUser = this.currentUser;


        this.switchToLogin = this.switchToLogin.bind(this);
        this.switchToSignUp = this.switchToSignUp.bind(this);
        this.switchToMainGame = this.switchToMainGame.bind(this);
        this.switchToProfile = this.switchToProfile.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleErrorClose = this.handleErrorClose.bind(this);

        this.handleInfo = this.handleInfo.bind(this);
        this.handleInfoClose = this.handleInfoClose.bind(this);
        this.getUserAchievement = this.getUserAchievement.bind(this);
        this.getTop10Kill = this.getTop10Kill.bind(this);

    }

    switchToSignUp() {
        this.setState((prevState, props) => {
            return {state: "signup"};
        })
    }

    switchToLogin() {
        this.setState((prevState, props) => {
            return {state: "login"};
        })
    }

    switchToMainGame() {
        this.setState((prevState, props) => {
            return {state: "maingame"};
        })
    }

    switchToProfile() {
        this.getUserAchievement();

        this.setState((prevState, props) => {
            return {state: "profile"};
        })
    }

    switchToAchievement() {
        this.setState((prevState, props) => {
            return {state: "profile"};
        })
    }

    getUserInfo() {
        let userid = this.currentUser.info.userid;

        if (!userid) {
            this.handleError("Unable to retrieve USER ID, please login again");
            return;
        }

        // Do async job
        axios.get("/api/user/" + userid).then(
            (res) => {
                this.currentUser.setInfo(res.data);
            }
        ).catch((error) => {
            this.handleError("Unable to retrieve User Profile");
        });
    }


    getUserAchievement() {
        let userid = this.currentUser.info.userid;

        if (!userid) {
            this.handleError("Unable to retrieve USER ID, please login again");
            return;
        }

        axios.get("/api/achievement/" + userid).then(
            (res) => {
                this.currentUser.setAchievement(res.data);
                this.setState({});
            }
        ).catch((error) => {
            this.handleError("Unable to retrieve User achievement");
        });
    }


    getTop10Kill() {
        axios.get("/api/achievement").then(
            (res) => {
                //     //console.log("GET TOP 10" + JSON.stringify(data));
                //     // displayTop10(data);

            }
        ).catch((error) => {
            this.handleError("Unable to retrieve Top 10 Player");
        });
    }


    handleError(message) {
        this.setState({
            error: true,
            errorMessage: message
        });
    }

    handleErrorClose() {
        this.setState(
            {
                error: false,
                errorMessage: ""
            }
        )

    }

    handleInfo(message) {
        this.setState({
            info: true,
            infoMessage: message
        });
    }

    handleInfoClose() {
        this.setState(
            {
                info: false,
                infoMessage: ""
            }
        )
    }


    render() {


        const state = this.state.state;


        let errorbar =
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={this.state.error}
                autoHideDuration={6000}
                onClose={this.handleErrorClose}
            >
                <MySnackbarContentWrapper
                    onClose={this.handleErrorClose}
                    variant="error"
                    message={this.state.errorMessage}
                />
            </Snackbar>;
        let infobar = <Snackbar
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            open={this.state.info}
            autoHideDuration={6000}
            onClose={this.handleInfoClose}
        >
            <MySnackbarContentWrapper
                onClose={this.handleInfoClose}
                variant="success"
                message={this.state.infoMessage}
            />
        </Snackbar>;
        if (state === 'login') {
            return (
                <main>
                    {errorbar}
                    {infobar}
                    <SignIn switchToMainGame={this.switchToMainGame}
                            switchToSignUp={this.switchToSignUp}
                            switchToLogin={this.switchToLogin}
                            currentUser={this.currentUser}
                            clientGameSocket={this.clientGameSocket}
                            getUserInfo={this.getUserInfo}
                            handleError={this.handleError}
                            handleInfo={this.handleInfo}
                    />
                </main>
            );
        } else if (state === "signup") {

            return (
                <main>

                    {errorbar}
                    {infobar}
                    <SignUp
                        switchToMainGame={this.switchToMainGame}
                        switchToSignUp={this.switchToSignUp}
                        switchToLogin={this.switchToLogin}
                        currentUser={this.currentUser}
                        clientGameSocket={this.clientGameSocket}
                        getUserInfo={this.getUserInfo}
                        handleError={this.handleError}
                        handleInfo={this.handleInfo}

                    />
                </main>);
        } else if (state === "maingame") {

            return (
                <main>
                    {errorbar}
                    {infobar}
                    <MainGame switchToLogin={this.switchToLogin}
                              switchToProfile={this.switchToProfile}
                              currentUser={this.currentUser}
                              clientGameSocket={this.clientGameSocket}
                              getUserInfo={this.getUserInfo}
                              game={this.game}
                              handleError={this.handleError}
                              handleInfo={this.handleInfo}


                    /></main>
            );
        } else if (state === "profile") {
            return (
                <main>

                    {errorbar}
                    {infobar}
                    <Profile switchToMainGame={this.switchToMainGame}
                             switchToLogin={this.switchToLogin}
                             currentUser={this.currentUser}
                             clientGameSocket={this.clientGameSocket}
                             getUserInfo={this.getUserInfo}
                             handleError={this.handleError}
                             handleInfo={this.handleInfo}
                    />
                </main>
            );
        }
    }
}


export default App;
