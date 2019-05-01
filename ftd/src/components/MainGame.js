import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import $ from "jquery";


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


    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },

    center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }

});


class MainGame extends React.Component {
    constructor(props) {
        super(props);
        this.currentUser = this.props.currentUser;
        this.clientGameSocket = this.props.clientGameSocket;

        this.handleStartNewGame = this.handleStartNewGame.bind(this);
        this.handleLogoutButton = this.handleLogoutButton.bind(this);
        $("#stage").show();

    }

    handleStartNewGame() {
        console.log("start", this.currentUser.info.userid);
        this.clientGameSocket.send("start", this.currentUser.info.userid);
    }

    handleLogoutButton() {
        this.props.handleInfo("Logout successful " + this.currentUser.info.userid);
        this.clientGameSocket.send("logout", this.currentUser.info.userid);
        this.currentUser.clear();
        this.props.switchToLogin();
    }

    render() {
        const {classes} = this.props;
        return (
            <div>
                <Grid container className={classes.root}
                      spacing={24}
                      alignItems="center"
                      justify="center"
                >
                    <Grid item xs={4}>
                        <Button className={classes.button}
                                variant="contained"
                                onClick={this.handleStartNewGame}
                                fullWidth>START
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button className={classes.button} variant="contained"
                                onClick={this.props.switchToProfile}

                                fullWidth> PROFILE</Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button className={classes.button} variant="contained" onClick={this.handleLogoutButton}
                                fullWidth>LOG
                            OUT</Button>
                    </Grid>
                </Grid>


            </div>

        );
    }
}


MainGame.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MainGame);
