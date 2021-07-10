import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMeh } from "@fortawesome/free-solid-svg-icons";

import './emoji.css';

/**
 * Propos: {color: String, icon: IconDefinition}
 */
export default class Emoji extends React.Component{
    render = ()=>{
        const color = this.props.color || '#e6e200';
        const icon = this.props.icon || faMeh;
        return (
            <div className="emoji" style={{backgroundColor: color}}>
                <FontAwesomeIcon icon={icon} />
            </div>
        );
    }
}