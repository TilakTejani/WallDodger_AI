class Space{
    constructor(h, w, mid){
        this.obstacles = []
        this.infinity = 100000
        this.ratio = 0.7
        this.margin = 0.05
        this.left = -this.infinity/2
        this.right = this.infinity/2
        
        this.h = h * (1 - this.margin)
        this.w = w * (1 - this.margin)
        this.topleft = {x : mid.x - this.w/2, y: mid.y - this.h/2}
        this.topright = {x: mid.x + this.w/2, y: mid.y - this.h/2}
        this.bottomleft = {x: mid.x - this.w/2, y: mid.y + this.h/2}
        this.bottomright = {x: mid.x + this.w/2, y: mid.y + this.h/2}

        this.edges = new Array(4)
        this.obstacles = []
        this.lastObstacle = this.topright.x

        this.#prepareObstacles(5)
    }

    update(ctx, mid, delta){
        this.h = ctx.canvas.height * (1 - this.margin)
        this.w = ctx.canvas.width * (1 - this.margin)
        this.#prepareBoard(mid, delta)
        // because of window handeling, need to update size of obstacles also
        this.obstacles.forEach(obstacle => {
          obstacle.update(this)
        })

        if(this.topleft.x > this.obstacles[0].x - 100){
            this.#prepareObstacles(1)
            this.obstacles.push(this.obstacles.shift())
            
        }
        
        if(this.topleft.x > this.obstacles[this.obstacles.length - 1].x ){
            this.obstacles.pop()
        }
    }

    draw(ctx){
        ctx.beginPath()
        ctx.fillStyle = "rgb(27, 66, 79)"
        ctx.moveTo(this.topleft.x, this.topleft.y)
        this.edges.forEach(edge => {
            ctx.lineTo(edge[1].x, edge[1].y)
        })
        ctx.stroke()
        ctx.fill()
        
        
        ctx.setLineDash([])
        this.obstacles.forEach(obstacle => obstacle.draw(ctx))



        ctx.beginPath()
        ctx.strokeStyle = "powderblue"
        ctx.setLineDash([10, 10])
        ctx.lineWidth = 2
        ctx.moveTo(-this.infinity, ctx.canvas.height * this.ratio)
        ctx.lineTo(this.infinity, ctx.canvas.height * this.ratio)
        ctx.stroke()

    }

    #prepareBoard(mid){
        this.topleft = {x : mid.x - this.w/2, y: mid.y -this.h/2}
        this.topright = {x: mid.x + this.w/2, y: mid.y - this.h/2}
        this.bottomleft = {x: mid.x - this.w/2, y: mid.y + this.h/2}
        this.bottomright = {x: mid.x + this.w/2, y: mid.y + this.h/2}
        this.edges[0] = [this.topleft, this.topright]
        this.edges[1] = [this.topright, this.bottomright]
        this.edges[2] = [this.bottomright, this.bottomleft]
        this.edges[3] = [this.bottomleft, this.topleft]
    }
    #prepareObstacles(nums = 100){
        for(let i = 0 ; i < nums ; ++i){
            this.obstacles.push(this.#getObstacle(this.lastObstacle))
            this.lastObstacle += 300
        }
    }
    #getObstacle(x, width = 100, margin = 100){
        return new Obstacles(x, this.topleft.y, this.bottomleft.y, lerp(this.topleft.y + margin + width , this.bottomleft.y - margin - width , Math.random()), width)
    }
}

class Obstacles{
    constructor(x, top, bottom, y, width) {
        this.x = x
        this.y = y
        this.width = width
        this.top = top
        this.bottom = bottom
        this.wall = new Array(2)
        this.wall[0] = [
            {x: x, y: top},
            {x: x, y: top + y}
        ]
        this.wall[1] = [
            {x: x, y: top + y + width},
            {x: x, y: bottom}
        ]

    }

    draw(ctx){

        this.wall.forEach(line => {
            ctx.beginPath()
            ctx.setLineDash([])
            ctx.strokeStyle = "powderBlue"
            ctx.lineWidth = 4
            ctx.moveTo(line[0].x, line[0].y)
            ctx.lineTo(line[1].x, line[1].y)
            ctx.stroke()
        })
        

    }

    update(space){
        this.y = (space.bottomleft.y - space.topleft.y)*this.y/(this.bottom - this.top)
        this.width = (space.bottomleft.y - space.topleft.y)*this.width/(this.bottom - this.top) > 100 ? 
                     this.width : (space.bottomleft.y - space.topleft.y)*100/(this.bottom - this.top) 
        this.top = space.topleft.y
        this.bottom = space.bottomleft.y
        this.wall = new Array(2)
        this.wall[0] = [
            {x: this.x, y: this.top},
            {x: this.x, y: this.top + this.y}
        ]
        this.wall[1] = [
            {x: this.x, y: this.top + this.y + this.width},
            {x: this.x, y: this.bottom}
        ]
    }
}

function lerp(A, B, t){
    return A + (B - A) * t
}