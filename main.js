var app
var won = 0, lost = 0
var numberOfBoxes = 3
var secondPhase = false

function createApplication(){
    app = new PIXI.Application({ width: 1024, height: 768, background: 0x1f202f });

    let canvasContainer = document.getElementById("canvasContainer");
    canvasContainer.appendChild(app.view);
}

function changeNumberOfBoxes(){
    const input = document.getElementById("numberOfBoxesInput")
    if(input.value < 3) input.value = 3
    if(input.value > 999) input.value = 1000
    numberOfBoxes = parseInt(input.value, 10)
    reset()
}

function reset(){
    app.stage.removeChildren()
    let boxes
    try {
        boxes = createBoxes(numberOfBoxes)
    } catch (error) {
        console.log("Couldn't create valid board - resetting")
        reset()
    }
    secondPhase = false

    boxes = setGraphicsElements(app.stage, boxes)
    drawBoxes(boxes)
}

function createBoxes(numberOfBoxes){
    let circles = []
    let maxIterations = 10000
    let iteration = 0

    let area = 1024 * 768
    let radius = Math.sqrt(area/(numberOfBoxes*Math.PI))*0.6

    while(circles.length < numberOfBoxes){
        var circle = {
            x: getRandomInt(radius, 1024-radius), 
            y: getRandomInt(radius, 768-radius),
            radius: radius
        }
        if(!isCircleOverlapping(circle, circles)){
            circles.push(circle)
        }

        iteration++
        if(iteration > maxIterations)
            break
    }

    if(circles.length !== numberOfBoxes) throw new Exception("Error");

    const winningBoxIndex = getRandomInt(0, numberOfBoxes-1)
    let boxes = []
    for(let i = 0; i < circles.length; i++){
        const e = circles[i];
        let a = Math.sqrt(Math.pow(2 * e.radius, 2) / 2)
        let box = {
            width: a,
            x: e.x - a/2,
            y: e.y - a/2,
            empty: false,
            winning: (i === winningBoxIndex) ? true : false,
            graphics: null
        }
        boxes.push(box)
    }

    return boxes;
}

function isCircleOverlapping(circle, circles){
    for(let i = 0; i < circles.length; i++){
        let other = circles[i]
        let distance = Math.sqrt(Math.pow((circle.x-other.x), 2) + Math.pow((circle.y-other.y), 2));
        if(distance < circle.radius + other.radius){
            return true
        }
    }
    return false;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setGraphicsElements(stage, boxes){
    for(let i = 0; i < boxes.length; i++){
        let graphics = new PIXI.Graphics();
        
        graphics.interactive = true;
        graphics.on('pointerdown', (event) => { handleClick(boxes, i) });

        graphics.x = boxes[i].x
        graphics.y = boxes[i].y

        // const text = new PIXI.Text(`${i}`, {
        //     fontFamily: 'Arial',
        //     fontSize: 24,
        //     fill: 0xff1010,
        //     align: 'center',
        // });
        // graphics.addChild(text)

        boxes[i].graphics = graphics
        stage.addChild(graphics)
    }

    return boxes
}

function getRandomIntExcludingIndex(length, excludeIndex){
    var randomNumber = Math.floor(Math.random()*length);
    if(randomNumber == excludeIndex){
        return getRandomIntExcludingIndex(length, excludeIndex);
    } else {
        return randomNumber;
    }
}

function handleClick(boxes, index){
    let indexOfNotEmptyBoxes = [ index ]

    if(boxes[index].winning){
        indexOfNotEmptyBoxes.push(getRandomIntExcludingIndex(numberOfBoxes, index))
    } else {
        let winningBoxIndex
        for(let i = 0; i < boxes.length; i++){
            if(boxes[i].winning){
                winningBoxIndex = i
            }
        }
        indexOfNotEmptyBoxes.push(winningBoxIndex)
    }

    for(let i = 0; i < boxes.length; i++){
        if(!indexOfNotEmptyBoxes.includes(i)){
            boxes[i].empty = true;
            boxes[i].graphics.interactive = false
        } else {
            boxes[i].graphics.removeAllListeners()
            boxes[i].graphics.on('pointerdown', (event) => { checkWinningCondition(boxes, i) });
        }

    }
    drawBoxes(boxes)
}

function checkWinningCondition(boxes, index){
    boxes.forEach(e => {
        e.graphics.interactive = false
    })
    if(boxes[index].winning){
        won++
    } else {
        lost++
    }
    secondPhase = true
    drawBoxes(boxes)
    updateWonLostUI()
    setTimeout(() => reset(), 1000)
}

function updateWonLostUI(){
    const wonElement = document.getElementById("won")
    const lostElement = document.getElementById("lost")
    wonElement.innerHTML = won
    lostElement.innerHTML = lost
}

function drawBoxes(boxes){
    for(let i = 0; i < boxes.length; i++){
        const graphics = boxes[i].graphics
        graphics.clear()
        
        graphics.lineStyle(1, 0x000000, 1);
        graphics.beginFill(0x1c96c2, 1)
        if(boxes[i].empty){
            graphics.beginFill(0xd9e6eb, 0.1)
        }
        if(secondPhase && !boxes[i].empty){
            if(boxes[i].winning)
                graphics.beginFill(0x00ff00, 1)
            else 
                graphics.beginFill(0xff0000, 1)
        }
        graphics.drawRect(0, 0, boxes[i].width, boxes[i].width)
        graphics.endFill()
    }
}

window.onload = () => {
    createApplication()
    reset()
}