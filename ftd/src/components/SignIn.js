import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';


import axios from 'axios';
import $ from "jquery";


const styles = theme => ({
    root: {
        flexGrow: 1,
    },
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


});

class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userid: "",
            password: ""
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        $("#stage").hide();
    }

    handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.target);
        const sdata = {};

        for (var pair of data.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }

        this.setState((prevState, props) => {
            return this.default_state;
        });


        sdata.userid = data.get('userid');
        sdata.password = data.get('password');

        axios.post("/api/user/login", sdata).then(
            (res) => {
                this.props.switchToMainGame();
                this.props.clientGameSocket.send('login', sdata.userid);
                this.props.currentUser.setUserid(sdata.userid);
                this.props.currentUser.setPassword(sdata.password);

                this.props.getUserInfo(sdata.userid);
                this.props.handleInfo("Welcome Back " + sdata.userid);
            }
        ).catch((error) => {
            this.props.handleError(error.response.data.error);
        });

    }

    render() {
        const {classes} = this.props;
        return (
            <main className={classes.main}>

                <CssBaseline/>
                <Paper className={classes.paper}>
                    <div>
                        <Button
                            onClick={this.props.switchToLogin}

                            color={"primary"}
                        >Log
                            In </Button>

                        <Button
                            onClick={this.props.switchToSignUp}>Register</Button>
                    </div>


                    <Avatar className={classes.avatar}>
                        JO
                    </Avatar>

                    <Typography component="h2" variant="h5">
                        JoJo's Royale Battle
                    </Typography>

                    <form className={classes.form} onSubmit={this.handleSubmit}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="userid">User ID</InputLabel>
                            <Input id="userid" name="userid" autoFocus/>

                        </FormControl>

                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <Input name="password" type="password" id="password"/>
                        </FormControl>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign In
                        </Button>
                    </form>

                </Paper>


            </main>
        );
    }
}


SignIn.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SignIn);
