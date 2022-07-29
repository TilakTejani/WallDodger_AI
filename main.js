let gameCanvas = document.getElementById("gameCanvas")
let gameCtx = gameCanvas.getContext('2d')
let visCanvas = document.getElementById("visCanvas")
let visCtx = visCanvas.getContext('2d')
const speed = 0.15

let balls, ball, space, mid, camera, lastTime, gameOver = false, startingLine, generation = 0, highScore, score, mode

let ballNum = 1000

addEventListener("keydown", (e) => {
    switch(e.key){
        case "d":   // debugging mode
            mode = "debug"
            ballNum = 1
            reset()
            start()
            break
        case "t":   // testing mode
            mode = "test"
            ballNum = 1000
            reset()
            start()
            break
    }
},{once : true})


async function reset(mode){
    gameCanvas.width = 600
    visCanvas.width = 600
    
    balls = new Array(ballNum)
    for(let i = 0 ; i < ballNum ; ++i){
        balls[i] = new Ball(gameCanvas.width/2, gameCanvas.height/2, speed * 20, 10, mode == "debug" ? "KEY" : "AI")
    }
    ball = balls[0]
    mid = {x : ball.x + gameCanvas.width * 0.2 , y : gameCanvas.height/2}
    camera = ball.x - gameCanvas.width * 0.7
    space = new Space(gameCanvas.height, gameCanvas.width, mid)
        
    score = 0
    startingLine = ball.x
    gameOver = false
}

function start(){
    document.getElementById("head").style.display = "none"
    animate()
}

async function startAgain(){

    if(!highScore || highScore < score){
        highScore = score
        generation++
        if(localStorage.getItem("bestball")) 
            localStorage.removeItem("bestball")
        localStorage.setItem("bestball", JSON.stringify(ball.brain))
        localStorage.setItem("highScore", JSON.stringify(score))
    }
    
    reset(mode)

    await new Promise(resolve => setTimeout(resolve, 1000))
    let isFirst = true
    balls.forEach(ball => {
        if(localStorage.getItem("bestball")){
            ball.brain = JSON.parse(
                localStorage.getItem("bestball")
            )
            for(let i = 0 ; !isFirst &&  i < ball.brain.levels.length ; ++i){
                ball.brain.levels[i] = Level.mutate(ball.brain.levels[i], 0.5)
            }
            isFirst = false
        }
    })
}

async function animate(timestamp){
    if(!lastTime)   {
        lastTime = timestamp
        requestAnimationFrame(animate)
        return
    }
    const delta = timestamp - lastTime
    lastTime = timestamp
    
    gameCanvas.height = window.innerHeight
    visCanvas.height = window.innerHeight
    if(mode == "test")
    {
        camera -= speed * delta
        mid.x += speed * delta
        mid.y = gameCanvas.height/2
    }
    balls.forEach(ball => {
        ball.xSpeed = delta * speed
    })
    
    
    space.update(gameCtx, mid)
    let done = true
    for(let i = 0 ; i < balls.length ; ++i){
        if(balls[i].update(space.topleft.y, space.bottomleft.y, space.obstacles[0].wall[0], space.obstacles[0].wall[1])){
            balls.splice(i, 1)
            done &= true
            i--
        }
        else
        done &= false
    }
    gameOver = done
    
    if(gameOver){

        await startAgain()
    }
    
    // debug mode
    if(mode == "debug"){
        mid.x =  balls[0].x - startingLine + gameCanvas.width * 0.7
        camera = startingLine - balls[0].x - gameCanvas.width * 0.2 
        mid.y = gameCanvas.height/2
    }
    
    let maxDis = Math.max(...balls.map(ball => ball.x))
    score = Math.floor((maxDis - startingLine) / 10)
    let bestball = balls.find(ball => 
        Math.floor(ball.x) == Math.floor(maxDis)
    )
    
    gameCtx.save()
    gameCtx.translate(camera, 0)
    

    space.draw(gameCtx)
    gameCtx.globalAlpha = 0.5
    for(let i = 0;  i < balls.length ;++i){
        balls[i].draw(gameCtx)
    }
    gameCtx.globalAlpha = 1
    bestball.draw(gameCtx, true)
    
    writeText(gameCtx, "HighScore:" + Math.floor(highScore), space.topleft.x + 10, space.topleft.y + 40, 20)
    // writeText(gameCtx, "HighScore:" + Math.floor(highScore), space.topleft.x + 10, space.topleft.y + 60, 20)
    writeText(gameCtx, "Score:" + score, space.topleft.x + 10, space.topleft.y + 60, 20)
    writeText(gameCtx, "Geneation:" + generation, space.topleft.x + 10, space.topleft.y + 80, 20)

    gameCtx.restore()

    visCtx.lineDashOffset= timestamp/60
    Visualizer.drawNetwork(visCtx, bestball.brain)

    requestAnimationFrame(animate)
}

function writeText(ctx, text, x, y, size = 10){
    ctx.beginPath()
    ctx.font = size + "px Arial";
    ctx.fillStyle = "powderblue"
    ctx.strokeStyle = "powderblue"
    ctx.fillText(text, x, y);
    ctx.fill()

    ctx.stroke()
}