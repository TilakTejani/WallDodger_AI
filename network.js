const VIS_BACKGROUND = window.getComputedStyle(document.getElementById("visCanvas"), null).getPropertyValue("background-color")
const COLOR1 = "rgb(0, 200, 255)"
const COLOR2 = "rgb(255, 200, 0)"
class Network{
    constructor(neuronCounts){
        this.levels = []
        for(let i = 0 ; i < neuronCounts.length - 1; ++i){
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]))
        }
    }
    // static method because JSON stringify removes object details  
    static feedForward(network, inputs){
        if(network.levels.length == 1){
            let outputs = Level.feedForward(network.levels[i], outputs, "output")
            return outputs
        }
        
        let outputs = Level.feedForward(network.levels[0],inputs, "hidden"), i = 0
        for(i = 1 ; i < network.levels.length - 1; ++i){
            outputs = Level.feedForward(network.levels[i], outputs, "hidden")
        }
        outputs = Level.feedForward(network.levels[i], outputs, "output")
        return outputs
    }
}

class Level{
    constructor(inputCount, outputCount){
        this.inputs = new Array(inputCount)
        this.outputs = new Array(outputCount)
        this.weights = new Array(inputCount)
        this.biases = new Array(outputCount)

        this.#randomise()
    }

    #randomise(){
        for(let i = 0 ; i < this.inputs.length ; ++i){
            this.weights[i] = []
            for(let j = 0 ; j < this.outputs.length ; ++j){
                this.weights[i].push(Math.random() * 2 - 1)
            }
        }
        for(let i = 0 ; i < this.outputs.length ; ++i){
            this.biases[i] = Math.random() * 2 - 1
        }
    }

    static mutate(level, alpha = 0.001){
        for(let i = 0 ; i < level.outputs.length ; ++i){
            for(let j = 0 ; j < level.inputs.length ; ++j){
                level.weights[j][i] = level.weights[j][i] + ((Math.random()*2 -1) - level.weights[j][i]) * alpha
            }
        level.biases[i] = level.biases[i] + ((Math.random() * 2 -1) - level.biases[i]) * alpha
        }
        return level
    }

    static feedForward(level, inputs, layerType){
        let rectifier = (val) => {
            return Math.max(val, 0)
        }

        let sigmoid = (val) => {
            return (1 / (Math.exp(-val) + 1))
        }

        let threshold = (val) => {
            return val > 0 ? 1 : 0
        }
        level.inputs = [...inputs]
        for(let i = 0 ; i < level.outputs.length ; ++i){
            let sum = -level.biases[i]
            for(let j = 0 ; j < level.inputs.length ; ++j){
                sum += level.weights[j][i] * inputs[j]
            }
            level.outputs[i] = threshold(sum)
        }
        return level.outputs
    }
}

// will take context of canvas and draw neural network onto them
class Visualizer{
    static drawNetwork(ctx, network){
        const margin = 50
        const left = margin
        const top = margin
        const width = ctx.canvas.width - 2 * margin
        const height = ctx.canvas.height - 2 * margin

        const levelHeight = height / network.levels.length
        const {levels} = network


        for(let i = levels.length - 1 ; i >= 0 ; i--){
            const levelTop = top + lerp(height - levelHeight, 0, levels.length == 1? 0.5 : i/(levels.length - 1)) 
            ctx.setLineDash([7,3])
            Visualizer.drawLevel(ctx, network.levels[i], left, levelTop, width, levelHeight, i == (levels.length - 1)? ['🠉','🠈','🠊','🠋']: [])
        }
    }

    static drawLevel(ctx, level, left, top, width, height, outputLabels){
        const right = left + width
        const bottom = top + height
        const {inputs, outputs, weights, biases} = level
        const nodeRadius = 18
        // drawing level weights
        for(let i = 0 ; i < inputs.length ; ++i){
            for(let j = 0 ; j < outputs.length ; ++j){
                ctx.beginPath();
                ctx.moveTo(
                    this.getNodeX(inputs, i, left, right), 
                    bottom
                )
                ctx.lineTo(
                    this.getNodeX(outputs, j, left, right), 
                    top
                )
                
                ctx.lineWidth = 2
                
                ctx.strokeStyle = getRGBA(weights[i][j])
                ctx.stroke()
            }
        }
        
        // drawing lowerNodes of level
        ctx.beginPath()
        for(let i = 0 ; i < inputs.length; ++i){
            const x = Visualizer.getNodeX(inputs, i, left, right)
            
            ctx.beginPath()
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI*2)
            ctx.fillStyle = VIS_BACKGROUND
            ctx.fill();

            ctx.beginPath()
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI*2)
            ctx.fillStyle = getRGBA(inputs[i])
            ctx.fill();

        }

        ctx.beginPath()
        // drawing upper nodes of level(for example output level)
        for(let i = 0 ; i < outputs.length; ++i){
            const x = Visualizer.getNodeX(outputs, i, left, right)
            
            ctx.beginPath()
            ctx.arc(x, top, nodeRadius , 0, Math.PI*2)
            ctx.fillStyle = VIS_BACKGROUND
            ctx.fill();
            
            ctx.beginPath()
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI*2)
            ctx.fillStyle = getRGBA(outputs[i])
            ctx.fill();

            ctx.beginPath()
            ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2)
            ctx.strokeStyle = getRGBA(biases[i])
            ctx.setLineDash([3,3])
            ctx.stroke()

            ctx.setLineDash([])
            if(outputLabels[i]){
                ctx.beginPath()
                ctx.textAlign = "center"
                ctx.textBaseLine = "middle"
                ctx.fillStyle = VIS_BACKGROUND
                ctx.strokeStyle = COLOR1
                ctx.font = nodeRadius * 1.5  + "px Arial"
                ctx.fillText(outputLabels[i], x, top + nodeRadius*0.55)
                ctx.lineWidth = 0.5
                ctx.strokeText(outputLabels[i], x, top + nodeRadius*0.55)
            }
        }

    }

    static getNodeX(node, index, left, right){
        return lerp(left, right, node.length == 1 ? 0.5 : index/(node.length - 1))
    }

}
function getRGBA(val){
    const alpha = Math.abs(val)
    const r = val > 0 ? 0 : 255
    const g = val > 0 ? 200 : 200 
    const b = val > 0 ? 255 : 0
    // const r = val < 0 ? 0 : 255
    // const g = r
    // const b = val > 0 ? 0 : 255
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")"
}