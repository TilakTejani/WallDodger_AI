class Controls{
    constructor(controlType = "KEY"){
        this.jump = false
        this.forward = false
        this.backward = false
        this.up = false
        this.down = false
        this.controlType = controlType
        if(this.controlType == "KEY"){
            this.#addKeyboardListener()
        }
    }

    #addKeyboardListener(){
        document.onkeydown = (event) => {
            switch(event.key){
                case " ":
                    this.jump = true;
                    break;
                case "ArrowUp":
                    this.up = true
                    break

                case "ArrowDown":
                    this.down = true
                    break
                case "ArrowRight":
                    this.forward = true
                    break
                case "ArrowLeft":
                    this.backward = true
                    break
            }
        }
        document.onkeyup = (event) => {
            switch(event.key){
                case " ":
                    this.jump = false;
                    break;
                case "ArrowUp":
                    this.up = false
                    break

                case "ArrowDown":
                    this.down = false
                    break
                case "ArrowRight":
                    this.forward = false
                    break
                case "ArrowLeft":
                    this.backward = false
                    break
            }
        }
    }
}