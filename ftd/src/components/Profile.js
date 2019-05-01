import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import GenderRadioButtons from "./GenderRadioButtons";
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import $ from "jquery";
import Grid from '@material-ui/core/Grid';


const styles = theme => ({
    main: {
        width: 'auto',
        display: 'block', // Fix IE 11 issue.
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    avatar: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,

    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },

    textField: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },

    button: {
        display: "flex"
    },

    buttonback: {
        marginTop: theme.spacing.unit * 2,
        display: "flex"
    },
    root: {
        marginTop: theme.spacing.unit * 2,
    }


});


class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.default_state = {
            conpassworderror: false,
            conpasswordmessage: "",
        }

        this.state = {
            conpassworderror: false,
            conpasswordmessage: ""
        }
        this.handleProfileSubmit = this.handleProfileSubmit.bind(this);
        this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
        this.handleDeleteUser = this.handleDeleteUser.bind(this);
        $("#stage").hide();
    }

    handleProfileSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.target);
        const sdata = {};
        //
        // for (var pair of data.entries())
        // {
        //     console.log(pair[0]+ ', '+ pair[1]);
        // }

        sdata.userid = this.props.currentUser.info.userid;
        sdata.password = this.props.currentUser.info.password;
        sdata.username = data.get('username');
        sdata.gender = data.get('gender');
        sdata.birthday = data.get('birthday');


        axios.put("/api/user/" + sdata.userid, sdata).then(
            (res) => {
                this.props.getUserInfo(sdata.userid);
                this.props.handleInfo("User Profile Updated Success");

            }
        ).catch((error) => {
            this.props.handleError(error.response.data.error);
        });

    }


    handlePasswordSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.target);
        const sdata = {};

        let userid = this.props.currentUser.info.userid;
        let password = this.props.currentUser.info.password;


        let newpassword = data.get('password');
        let conpassword = data.get('conpassword');


        this.setState((prevState, props) => {

            return this.default_state;
        });


        if (newpassword !== conpassword) {
            this.setState((prevState, props) => {
                return {conpassworderror: true, conpasswordmessage: "Password Mismatch"};
            });
            return;
        }


        // var putData = {};
        sdata["password"] = password;
        sdata["newpassword"] = newpassword;


        axios.put("/api/user/password/" + userid, sdata).then(
            (res) => {

                this.props.handleInfo("Password Updated Success");
                this.props.currentUser.setPassword(newpassword);

            }
        ).catch((error) => {
            this.props.handleError(error.response.data.error);
        });

    }


    handleDeleteUser() {
        let r = window.confirm("You can not recover your account after deletion, click confirm to proceed");
        if (r === true) {
        } else {
            return;
        }

        let userid = this.props.currentUser.info.userid;
        let password = this.props.currentUser.info.password;

        let sdata = {};
        sdata['password'] = password;

        axios.delete("/api/user/" + userid, {data: sdata}).then(
            (res) => {
                this.props.handleInfo("User " + userid + " Deleted");
                this.props.currentUser.clear();
                this.props.switchToLogin();
            }
        ).catch((error) => {
            this.props.handleError("User deletion failed");
        });

    }

    render() {
        const {classes} = this.props;
        return (
            <main className={classes.main}>
                <CssBaseline/>
                <Paper className={classes.paper}>
                    <Typography component="h1" variant="h4">
                        Welcome Back, {this.props.currentUser.info.username}
                    </Typography>


                    <Typography className={classes.root} component="h1" variant="h5">
                        Achievement
                    </Typography>


                    <Grid container className={classes.root} spacing={16}>
                        <Grid item xs={4}>
                            <TextField
                                id="standard-name"
                                label="User ID"
                                className={classes.textField}
                                value={this.props.currentUser.info.userid}
                                margin="normal"
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                id="outlined-kill"
                                label="KILL"
                                className={classes.textField}
                                value={this.props.currentUser.achievement.kill}
                                margin="normal"
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                id="outlined-damage"
                                label="DAMAGE"
                                className={classes.textField}
                                value={this.props.currentUser.achievement.damage}
                                margin="normal"
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>


                    <form className={classes.form} onSubmit={this.handleProfileSubmit}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="username">User Name</InputLabel>
                            <Input name="username" id="username" defaultValue={this.props.currentUser.info.username}/>
                        </FormControl>


                        <GenderRadioButtons state={this.props.currentUser.info.gender}/>


                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="date" required={true} shrink={true}>Birthday</InputLabel>
                            <Input name="birthday" type="date" id="birthday"
                                   defaultValue={this.props.currentUser.info.birthday}/>
                        </FormControl>


                        <div>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                            >
                                CHANGE PROFILE
                            </Button>
                        </div>

                    </form>


                    <form className={classes.form} onSubmit={this.handlePasswordSubmit}>

                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <Input name="password" type="password" id="password"/>
                        </FormControl>


                        <FormControl margin="normal" required fullWidth error={this.state.conpassworderror}>
                            <InputLabel htmlFor="conpassword">Confirm Password</InputLabel>
                            <Input name="conpassword" type="password" id="conpassword"/>
                            <FormHelperText>{this.state.conpasswordmessage}</FormHelperText>
                        </FormControl>

                        <Grid container className={classes.root}
                              spacing={24}
                              alignItems="center"
                              justify="center"
                        >
                            <Grid item xs={6}

                                  alignItems="center"
                                  justify="center">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    className={classes.button}

                                >
                                    CHANGE
                                </Button>
                            </Grid>
                            <Grid item xs={6}
                                  alignItems="center"
                                  justify="center">
                                <Button className={classes.button}
                                        variant="contained"
                                        color="secondary"
                                        fullWidth
                                        onClick={this.handleDeleteUser}
                                > DELETE USER
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                    <Button className={classes.buttonback} onClick={this.props.switchToMainGame}>BACK TO GAME</Button>

                </Paper>
            </main>
        );
    }
}


Profile.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);
