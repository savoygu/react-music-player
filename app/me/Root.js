import React from 'react';
import Header from './components/header';
import Player from './pages/player';
import MusicList from './pages/musiclist';
import { MUSIC_LIST, TIMELINE } from './config/musiclist';
import { Router, IndexRoute, Link, Route, hashHistory } from 'react-router';
import Pubsub from 'pubsub-js';

let App = React.createClass({
    getInitialState () {
        return {
            musicList: MUSIC_LIST,
            currentMusicItem: MUSIC_LIST[TIMELINE].data[0],
            repeatType: 'cycle',
            timeline: TIMELINE // 正在播放的是那个时代的歌曲：past, now, furture
        }
    },
    playMusic (musicItem) {
        $('#player').jPlayer('setMedia', {
            mp3: musicItem.file
        }).jPlayer('play');

        this.setState({
            currentMusicItem: musicItem
        })
    },
    playNext (type = 'next') {
        const { musicList, currentMusicItem, timeline } = this.state;
        let index = this.findMusicIndex(currentMusicItem);
        let newIndex = null;
        let musicListData = musicList[timeline].data
        let musicListLength = musicListData.length;
        if (type === 'next') {
            newIndex = (index + 1) % musicListLength;
        } else {
            newIndex = (index - 1 + musicListLength) % musicListLength;
        }

        this.playMusic(musicListData[newIndex])
    },
    findMusicIndex (musicItem) {
        return this.state.musicList[this.state.timeline].data.indexOf(musicItem);
    },
    componentDidMount () {
        $('#player').jPlayer({
            supplied: 'mp3',
            wmode: 'window'
        });
        this.playMusic(this.state.currentMusicItem);

        $('#player').bind($.jPlayer.event.ended, (e) => { // 播放结束
            const { repeatType, musicList, currentMusicItem, timeline } = this.state
            if (repeatType === 'cycle') {
                this.playNext();
            } else if (repeatType === 'once') {
                this.playMusic(currentMusicItem);
            } else if (repeatType === 'random') {
                let index = Math.floor(Math.random() * musicList.length)
                this.playMusic(musicList[timeline].data[index])
            }
        })

        Pubsub.subscribe('PLAY_MUSIC', (msg, musicItem) => {
            this.playMusic(musicItem);
        });

        Pubsub.subscribe('DELETE_MUSIC', (msg, musicItem) => {
            const { musicList, timeline } = this.state
            musicList[timeline].data = musicList[timeline].data.filter(item => {
                return item !== musicItem;
            })
            this.setState({
                musicList: musicList
            })
        });

        PubSub.subscribe('PLAY_PREV', (msg) => {
            this.playNext('prev');
        });

        PubSub.subscribe('PLAY_NEXT', (msg) => {
            this.playNext();
        });

        let repeatList = [
            'cycle',
            'once',
            'random'
        ];
        PubSub.subscribe('CHANAGE_REPEAT', (msg) => {
            let index = repeatList.indexOf(this.state.repeatType);
            index = (index + 1) % repeatList.length;
            this.setState({
                repeatType: repeatList[index]
            });
        });

        PubSub.subscribe('SWITCH_TIMELINE', (msg, timeline) => {
            this.setState({
                timeline: timeline
            })
        })
    },
    componentWillUnmount () {
        Pubsub.unsubscribe('PLAY_MUSIC');
        Pubsub.unsubscribe('DELETE_MUSIC');
        Pubsub.unsubscribe('PLAY_PREV');
        Pubsub.unsubscribe('PLAY_NEXT');
        Pubsub.unsubscribe('CHANAGE_REPEAT');
        Pubsub.unsubscribe('SWITCH_TIMELINE');
        $('#player').unbind($.jPlayer.event.ended);
    },
    render () {
        return (
            <div>
                <Header />
                {React.cloneElement(this.props.children, this.state)}
            </div>
        );
    }
});

let Root = React.createClass({
    render () {
        return (
            <Router history={hashHistory}>
                <Route path="/" component={App}>
                    <IndexRoute component={Player}></IndexRoute>
                    <Route path="/list" component={MusicList}></Route>
                </Route>
            </Router>
        )
    }
});

export default Root;
