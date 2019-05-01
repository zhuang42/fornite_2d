import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const styles = theme => ({

    formControl: {
        width: '100%',
        marginTop: theme.spacing.unit * 2,
    },
    group: {
        margin: 0,
    },
});

class GenderRadioButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.state,
        };

    }


    handleChange = event => {
        this.setState({value: event.target.value});
    };

    render() {
        const {classes} = this.props;

        return (
            <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                    row
                    aria-label="Gender"
                    name="gender"
                    className={classes.group}
                    value={this.state.value}
                    onChange={this.handleChange}
                >
                    <FormControlLabel value="Female" control={<Radio/>} label="Female"/>
                    <FormControlLabel value="Male" control={<Radio/>} label="Male"/>
                    <FormControlLabel value="Unknown" control={<Radio/>} label="Other"/>
                </RadioGroup>
            </FormControl>
        );
    }
}

GenderRadioButtons.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GenderRadioButtons);