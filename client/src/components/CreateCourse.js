import React, { Component } from 'react';

import Form from './Form';

export default class CreateCourse extends Component {
    state = {
        title: '',
        description: '',
        estimatedTime: '',
        materialsNeeded: '',
        errors: [],
    }

    render() {
        const { firstName, lastName } = this.props.context.authenticatedUser;
        const {
            title,
            description,
            estimatedTime,
            materialsNeeded,
            errors,
        } = this.state;

        

        return (
            <div className="bounds course--detail">
                <h1>Create Course</h1>
                <div>
                   <Form 
                        cancel={this.cancel}
                        errors={errors}
                        submit={this.submit}
                        submitButtonText="Create Course"
                        elements={() => (
                            <div>
                                <div className="grid-66">
                                    <div className="course--header">
                                        <h4 className="course--label">Course</h4>
                                        <div>
                                            <input
                                                id="title"
                                                className="input-title course--title--input"
                                                name="title"
                                                type="text"
                                                value={title}
                                                onChange={this.change}
                                                placeholder="Course Title..." />
                                        </div>
                                        <p>{`By ${firstName} ${lastName}`}</p>
                                    </div>
                                    <div className="course--description">
                                        <div>
                                            <textarea id="description" name="description" value={description} onChange={this.change} placeholder="Course Description..." ></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-25 grid-right">
                                    <div className="course--stats">
                                        <ul className="course--stats--list">
                                            <li className="course--stats--list--item">
                                                <h4>Estimated Time</h4>
                                                <div>
                                                    <input
                                                        id="estimatedTime"
                                                        className="course--time--input"
                                                        name="estimatedTime"
                                                        type="text"
                                                        value={estimatedTime}
                                                        onChange={this.change}
                                                        placeholder="Hours" />
                                                </div>
                                            </li>
                                            <li className="course--stats--list--item">
                                                <h4>Materials Needed</h4>
                                                <div>
                                                    <textarea id="materialsNeeded" name="materialsNeeded" value={materialsNeeded} onChange={this.change} placeholder="List Materials..."></textarea>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div> 
                            </div>
                            
                        )} /> 
                </div>
                
            </div>
        );
    }

    change = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        this.setState(() => {
            return {
                [name]: value
            };
        });
    }

    submit = () => {
        const { context } = this.props;
        const { emailAddress, password } = context.authenticatedUser;

        const {
            title,
            description,
            estimatedTime,
            materialsNeeded,
        } = this.state;

        // New course payload
        const course = {
            title,
            description,
            estimatedTime,
            materialsNeeded,
        };

        context.data.createCourse(course, emailAddress, password)
            .then( errors => {
                if (errors.length) {
                    this.setState({ errors });
                } else {
                    console.log(`${emailAddress} has successfully created a new post`)
                    this.props.history.push('/');
                }
            })
            .catch( err => {
                console.log(err);
                this.props.history.push('/error');
            })
    }

    cancel = () => {
        this.props.history.push('/');
    }
}