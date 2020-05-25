import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default class CourseDetail extends Component {
    state = {
        courseDetail: {},
        authorized: false,
    }

    componentDidMount(){
        this.display();
    }

    render() {
        const {
            courseDetail,
            authorized,
        } = this.state;

        const {
            removeCourse
        } = this.props.context.actions;

        return (
            <div>
                <div className="actions--bar">
                    <div className="bounds">
                        <div className="grid-100">
                            <span>
                                {authorized ? 
                                    <React.Fragment>
                                        <Link className="button" to={`/courses/${courseDetail.id}/update`}>Update</Link>
                                        <Link className="button" onClick={() => {
                                            removeCourse(courseDetail.id);
                                            }} to="/" >Delete</Link>
                                        <Link className="button button-secondary" to="/">Return to List</Link>
                                    </React.Fragment>
                                :
                                    <Link className="button button-secondary" to="/">Return to List</Link>
                                }
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bounds course--detail">
                    <div className="grid-66">
                        <div className="course--header">
                            <div className="course--label">Course</div>
                            <div className="course--title">{courseDetail.title}</div>
                            <p>{courseDetail.User ? `By ${courseDetail.User.firstName} ${courseDetail.User.lastName}`: 'By anonymous'}</p>
                        </div>
                        <ReactMarkdown className="course--description" source={courseDetail.description} />
                    </div>
                    <div className="grid-25 grid-right">
                        <div className="course--stats">
                            <ul className="course--stats--list">
                                <li className="course--stats--list--item">
                                    <h4>Estimated Time</h4>
                                    <h3>{courseDetail.estimatedTime}</h3>
                                </li>
                                <li className="course--stats--list--item">
                                    <h4>Materials Needed</h4>
                                    <ReactMarkdown source={courseDetail.materialsNeeded} />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    display = () => {
        const { context, match } = this.props;
        context.data.getCourse(match.params.id)
            .then(course => {
                if (context.authenticatedUser) {
                    if (context.authenticatedUser.id === course.User.id) {
                        this.setState(() => {
                            return {
                                courseDetail: { ...course },
                                authorized: true,
                            }
                        });
                    } else {
                        this.setState(() => {
                            return {
                                courseDetail: { ...course },
                            }
                        });
                    }
                } else {
                    this.setState(() => {
                        return {
                            courseDetail: { ...course },
                        }
                    });
                }
            });
    }
}