import React from 'react';
import {Link} from 'react-router';
import './header.less';

let Header = React.createClass({
    render () {
        return (
            <div className="components-header row">
                <img src="/static/images/logo.png" width="40" alt="" className="-col-auto"/>
                <h1 className="caption"><Link to="/">React Music Player</Link></h1>
            </div>
        )
    }
})

export default Header;
