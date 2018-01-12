import React from 'react';
import MusicListItem from '../components/musiclistitem';
import Pubsub from 'pubsub-js';
import './musiclist.less';

let MusicList = React.createClass({
    switchTimeline (timeline) {
        Pubsub.publish('SWITCH_TIMELINE', timeline)
    },
    render () {
        let listEle = null;
        let radioEle = null;
        const {musicList, currentMusicItem, timeline} = this.props
        radioEle = Object.keys(musicList).map((key, index, list) => {
            return (
                <label key={key} className={ key === timeline ? 'focus': ''}>
                    <input type="radio" name="timeline" value={key} checked={key === timeline} onChange={this.switchTimeline.bind(this, key)}/> {musicList[key].title}
                </label>
            )
        })
        listEle = musicList[timeline].data.map(item => {
            return (
                <MusicListItem
                    focus={item === this.props.currentMusicItem}
                    key={item.id}
                    musicItem={item}
                >
                    {item.title}
                </MusicListItem>
            )
        });

        return (
            <div className="components-musiclist">
                <div className="timeline">
                    {radioEle}
                </div>
                <ul>
                    {listEle}
                </ul>
            </div>
        );
    }
});

export default MusicList;
