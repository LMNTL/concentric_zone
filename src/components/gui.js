import React from 'react';

const GUI = (props) => (
    <div
        style={{
            position: 'fixed',
            bottom: '4vh',
            width: '80vw',
            backgroundColor: 'rgba(155, 155, 155, 0.7)',
            background: `linear-gradient(90deg, rgba(255,0,0,.8), rgba(255,0,0,0.8) ${100*props.hp/props.maxHP}%, rgba(255,0,0,0) ${(100*props.hp/props.maxHP)+5}%)`,
            transition: 'background 0.2s',
            padding: '5vh 10vw',
            zIndex: '100'
        }}
    >
        Zone: {props.currentZone} HP: {props.hp} / {props.maxHP} Time: {props.gameTime}       
    </div>
);

export default GUI;
