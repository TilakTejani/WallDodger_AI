class Ball{
    constructor(x, y, speed, radius = 10, controlType = "KEY"){
        this.x = x
        this.y = y
        this.radius = radius
        this.thrust =  1.25 * speed
        this.xSpeed = speed
        this.ySpeed = 0
        this.gravity = -speed / 30
        this.color = "powderblue"
        this.controls = new Controls(controlType)
        this.brain = new Network([4, 3, 2, 1])
        this.useBrain = false
        if(controlType == "AI"){
            this.useBrain = true
        }
        this.lines = new Array(2)
    }
    draw(ctx, drawLines = false){

        if(drawLines){
            ctx.setLineDash([5, 2])
            this.lines.forEach(line =>{
                ctx.beginPath()
                ctx.lineWidth = 1
                ctx.strokeStyle = "rgb(255, 200, 0)"
                ctx.moveTo(line[0].x, line[0].y)
                ctx.lineTo(line[1].x, line[1].y)
                ctx.stroke()
            })
        }

        
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = "rgb(27, 66, 79)"
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, 2*Math.PI)
        ctx.fill()
    }

    update(top, bottom, topWall, bottomWall){
        if(!this.#assessDamage(top, bottom, topWall, bottomWall))
        {
            return true
        }
        let offsets = this.#generateOffsets(top, bottom, topWall, bottomWall)
        let outputs = Network.feedForward(this.brain, [...offsets])
        this.lines[0] = ([{x : this.x , y : this.y}, {x : topWall[1].x , y : topWall[1].y}])
        this.lines[1] = ([{x : this.x , y : this.y}, {x : bottomWall[0].x , y : bottomWall[0].y}])
        if(this.useBrain){
            if(outputs[0]){
                this.controls.jump = true
            }
            if(!outputs[0]){
                this.controls.jump = false
            }
            if(this.controls && this.controls.jump){
                this.ySpeed = this.thrust
            }
            this.ySpeed += this.gravity
            this.y -= this.ySpeed
            this.x += this.xSpeed
        }
        else{
            if(this.controls.up)
                this.y -= 2
            if(this.controls.down)
                this.y += 2
            if(this.controls.forward)
                this.x += 2
            if(this.controls.backward)
                this.x -= 2
        }
        return false
    }
    
    #generateOffsets(top, bottom, topWall, bottomWall){
        let lerp = (a, b, t) => {
            return a + (b - a)*t
        }

        let getDis = (x1, y1, x2, y2) => {
            return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        }

        let getAngle = (x1, y1, x2, y2) => {
            return Math.atan((y2 - y1)/(x2 - x1))
        }
        // xrange = xspeed * time to get thrust reveresed
        // yrange = time to get Kinetic Energy of y to zero
        let xrange = this.xSpeed * (2 * this.thrust / this.gravity)
        let yrange = (this.thrust ** 2) / 2 / this.gravity
        let range = Math.sqrt((xrange ** 2) + (yrange ** 2))

        let dis1 = getDis(this.x, this.y, topWall[1].x, topWall[1].y)
        let dis2 = getDis(this.x, this.y, bottomWall[0].x, bottomWall[0].y)
        let theta1 = getAngle(this.x, this.y, topWall[1].x, topWall[1].y)
        let theta2 = getAngle(this.x, this.y, bottomWall[0].x, bottomWall[0].y)
        

        // optimistic condition to pass ball through obstacle
        //  which is ball is at mid point of gap between walls
        let minAngle = -Math.PI/2           // angle with upper wall
        let maxAngle = Math.PI/2            // angle with lower wall
        let minDis = (bottomWall[0].y - topWall[1].y) / 2       // when ball is between passing through walls from mid point of gap
        let maxDis = 600

        let offsets = [
            lerp(0, 1, (dis1 - minDis)/(maxDis - minDis)),
            lerp(0, 1, (dis2 - minDis) / (maxDis -minDis)),
            1 - lerp(0, 1, (theta1 - minAngle) / (maxAngle - minAngle)),
            1 - lerp(0, 1, (theta2 - minAngle) / (maxAngle - minAngle))
        ]


        return offsets
    }

    #assessDamage(top, bottom, topWall, bottomWall){
        if(this.y <= top + this.radius){
            return false
        }   
        if(this.y >= bottom - this.radius){
            return false
        }
        if(this.y - this.radius <= topWall[1].y || this.y + this.radius >= bottomWall[0].y){
            if(this.x + this.radius >= topWall[1].x && this.x - this.radius <= topWall[1].x){
                return false
            }
        }
        return true
    }
}
