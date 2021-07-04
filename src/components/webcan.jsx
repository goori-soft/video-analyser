import React from 'react'
import * as faceapi from 'face-api.js'

import expressionsMap from '../util/expressions-map'

import './webcan.css'

export default class Webcan extends React.Component{

    constructor(props){
        super(props);
        this.videoRef = React.createRef();
        this.canvasRef = React.createRef();
        this.displaySize = {width: 0, height: 0};
        this.lang = 'pt';
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
                        currentMood = expressionsMap[mood][this.lang]
                    }
                // }
                // else{
                //     neutralValue = value
                // }
            }
        }
        
        if(currentMood) console.log(currentMood, parseInt(max), parseInt(neutralValue));
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
            <div className="webcan-container">
                <video className="mirror" ref={this.videoRef} autoPlay={true} muted></video>
                <canvas className="mirror" ref={this.canvasRef}></canvas>
            </div>
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
        }, 100)
    }
}