import React from 'react'
import ReactDOM from 'react-dom';
import * as faceapi from 'face-api.js'
import Emoji from './emoji'
import expressionsMap from '../util/expressions-map'

import './webcan.css'

export default class Webcan extends React.Component{

    constructor(props){
        super(props)
        this.videoRef = React.createRef()
        this.canvasRef = React.createRef()
        this.displaySize = {width: 0, height: 0}
        this.lang = 'pt'
        this.history = []
        this.emojiContainerRef = React.createRef()
        this.emojiContainerTmpRef = React.createRef()
    }

    appendHistory = (historyObj)=>{
        const lastHistoryObj = this.getLastHistoryObj()
        if (lastHistoryObj == null || lastHistoryObj.mood != historyObj.mood || historyObj.time > (lastHistoryObj.time + 1000*4) ){
            this.history.push(historyObj)
            this.forceUpdate()
        }
    }

    componentDidMount = ()=>{
        const video = this.videoRef.current;
        video.addEventListener('play', ()=>{
            this.startAnalyser()
        });

        this.init().then(()=>{
            const options = {video: {}}
            navigator.mediaDevices.getUserMedia(options)
                .then( stream => {this.define(stream)} )
                .catch( err => {this.errorAccessVideo()})
        }).catch(err=>{
            console.log(err)
        });
    }

    define = (stream)=>{
        const video = this.videoRef.current;
        const canvas = this.canvasRef.current;
        this.displaySize = {width: video.offsetWidth, height: video.offsetHeight};
        video.srcObject = stream;
        canvas.setAttribute('width', this.displaySize.width)
        canvas.setAttribute('height', this.displaySize.height)
    }

    errorAccessVideo = ()=>{
        console.log('O usuário negou acesso a webcan ou o computador não possui este dispositivo.')
    }

    getEmojiComponent = (historyObj)=>{
        let map = expressionsMap[historyObj.mood]
        if (map){
            return <Emoji key={historyObj.time} icon={map.icon} label={map[this.lang]} color={map.color}/>
        }
        return  null
    }
    
    getLastHistoryObj = ()=>{
        if (this.history.length <= 0) return null
        return this.history[this.history.length - 1]
    }

    getMoodList = ()=>{
        const maxItems = 10
        const history = [];
        const historyParts = this.history.slice(Math.max(this.history.length - maxItems, 0)); //
        for (let index in historyParts){
            const historyObj = historyParts[index];
            let map = expressionsMap[historyObj.mood]
            if (map){
                history.push(<Emoji key={historyObj.time} icon={map.icon} label={map[this.lang]} color={map.color}/>)
            }
        }

        return history
    }

    init = ()=>{
        return Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
    }

    processMood = (expressions)=>{
        let max = 0
        let neutralValue = 0
        let currentMood = null
        for (let mood in expressions){
            if (expressionsMap[mood]){
                let value = expressions[mood] * 100 / expressionsMap[mood].accurance
                //if (mood != 'neutral'){
                    if (value > max){
                        max = value;
                        currentMood = mood
                    }
                // }
                // else{
                //     neutralValue = value
                // }
            }
        }
        
        const historyObj = {
            time: Date.now(),
            mood: currentMood,
            data: expressions
        }

        this.appendHistory(historyObj)
        //if(currentMood) console.log(currentMood, parseInt(max), parseInt(neutralValue));
        return currentMood
    }

    processDetections = (detections)=>{
        if (detections.length > 0){
            const detection = detections[0];
            const mood = this.processMood(detection.expressions);
        }
    }

    render = ()=>{

        return (
            <>
            <div className="webcan-container">
                <video className="mirror" ref={this.videoRef} autoPlay={true} muted></video>
                <canvas className="mirror" ref={this.canvasRef}></canvas>
                <div className="emoji-container" ref={this.emojiContainerRef}>
                    {this.getMoodList()}
                </div>
            </div>
            </>
        )
    }

    startAnalyser = async ()=>{
        const video = this.videoRef.current
        const canvas = this.canvasRef.current
        const ctx = canvas.getContext('2d');
        const detections = await faceapi.detectAllFaces(this.videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions(); //.withFaceLandmarks()
        const resizedDetections = faceapi.resizeResults(detections, this.displaySize)
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //faceapi.draw.drawDetections(canvas, resizedDetections)
        //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        
        this.processDetections(detections)

        setTimeout(()=>{
            this.startAnalyser()
        }, 300)
    }
}