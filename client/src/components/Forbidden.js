import React from 'react';
import { Link } from 'react-router-dom';

export default () => (
  <div className="bounds">
    <h1>Forbidden</h1>
    <p>You are not authorized to make changes to this course.</p>
    <Link className="button" to="/">Return Home</Link>
  </div>
);