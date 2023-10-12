// let canvas = document.getElementById("canvas");
// let context = canvas.getContext("2d");

class Ghost{
    constructor(x,y,width,height,speed, imageX, imageY, imageWidth, imageHeight, range){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed =speed;
        this.imageX = imageX;
        this.imageY = imageY;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.range = range;
        this.tarbool = false;
        this.pastSpeed = -speed;
        this.direction = DIRECTION_RIGHT;
        this.currentFrame = 1;
        this.frameCount = 7;
        this.nextDirection = this.direction;
        this.randomTargetIndex = parseInt(Math.random() * randomTargetsForGhosts.length);
        setInterval(()=>{
            if (this.tarbool == false)
            {
                this.changeRandomDirection();
            }
        },100);

    }

    changeRandomDirection () {
        this.randomTargetIndex +=parseInt(Math.random()*4);
        this.randomTargetIndex = this.randomTargetIndex%4;
    }
    moveProcess () {
        if (this.isInRangeOfPacman()){
            this.target = pacman;
            this.tarbool = true;
        }
        else {
            this.tarbool = false;
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }

        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollision()) {
            // this.speed = -this.speed;
            this.moveBackwards();
            // this.speed = -this.speed;
            // this.pastSpeed = this.speed;
        }

    }

    // eat () {
    //     for (let i=0;i<map.length;i++){
    //         for (let j=0;j<map[0].length;j++)
    //         {
    //             if (map[i][j]==2 && this.getMapX() == j && this.getMapY()==i)
    //             {
    //                 map[i][j]= 3;
    //                 score++;
    //             }
    //         }
    //     }
    // }

    moveBackwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT:
                this.x -= this.speed;
                break;
            case DIRECTION_LEFT:
                this.x += this.speed;
                break;
            case DIRECTION_UP:
                this.y += this.speed;
                break;
            case DIRECTION_DOWN:
                this.y -= this.speed;
                break;
        }
    }

    moveForwards(){
        switch (this.direction) {
            case DIRECTION_RIGHT:
                this.x += this.speed;
                break;
            case DIRECTION_LEFT:
                this.x -= this.speed;
                break;
            case DIRECTION_UP:
                this.y -= this.speed;
                break;
            case DIRECTION_DOWN:
                this.y += this.speed;
                break;
        }
    }
    checkCollision(){
        if (map[this.getMapY()][this.getMapX()] == 1 || 
        map[this.getMapY()][this.getMapXRight()] == 1 || 
        map[this.getMapYRight()][this.getMapX()] == 1 || 
        map[this.getMapYRight()][this.getMapXRight()] == 1) 
        {
            return true;
        }
        return false;
    }
    

    isInRangeOfPacman(){
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        if (Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range)
        {
            return true;
        }
        return false
    }
    changeDirectionIfPossible(){
        let tempDirection = this.direction;
        this.direction = this.calculateNewDirection(map,parseInt(this.target.x/oneBlockSize),parseInt(this.target.y/oneBlockSize));
        
        if (typeof this.direction == "undefined")
        {
            this.direction = tempDirection;
            return;
        }

        this.moveForwards();
        if (this.checkCollision())
        {
            // this.speed = -this.speed;
            this.moveBackwards();
            this.direction = tempDirection;
        }
        else 
        {
            this.moveBackwards();
        }
    } 
    calculateNewDirection(map,destX,destY){
        let mp =[];
        for (let i=0;i<map.length;i++){
            mp[i]=map[i].slice();
        }
        let queue = [
            {
                x: this.getMapX(),
                y: this.getMapY(),
                moves: [],
            },
        ];

        while (queue.length > 0) {
            let popped = queue.shift();
            if (popped.x == destX && popped.y == destY){
                return popped.moves[0]
            }
            else{
                mp[popped.y][popped.x]=1;
                let neighborList = this.addNeighbors(popped, mp);
                for (let i=0; i<neighborList.length; i++)
                {
                    queue.push(neighborList[i]);
                }
            }
        }
        return DIRECTION_UP;
    }

    addNeighbors(popped,mp){
        let queue = [];
        let numOfRows = mp.length;
        let numOfCols = mp[0].length;

        if (popped.x - 1>=0 && popped.x - 1 < numOfRows && mp[popped.y][popped.x-1] !=1){
            let tempMoves = popped.moves.slice();
            tempMoves.push(DIRECTION_LEFT);
            queue.push({x:popped.x - 1, y:popped.y, moves:tempMoves});
        }
        if (
            popped.x + 1 >= 0 &&
            popped.x + 1 < numOfRows &&
            mp[popped.y][popped.x + 1] != 1
        ) {
            let tempMoves = popped.moves.slice();
            tempMoves.push(DIRECTION_RIGHT);
            queue.push({ x: popped.x + 1, y: popped.y, moves: tempMoves });
        }
        if (
            popped.y - 1 >= 0 &&
            popped.y - 1 < numOfCols &&
            mp[popped.y - 1][popped.x] != 1
        ) {
            let tempMoves = popped.moves.slice();
            tempMoves.push(DIRECTION_UP);
            queue.push({ x: popped.x, y: popped.y - 1, moves: tempMoves });
        }
        if (
            popped.y + 1 >= 0 &&
            popped.y + 1 < numOfCols &&
            mp[popped.y + 1][popped.x] != 1
        ) {
            let tempMoves = popped.moves.slice();
            tempMoves.push(DIRECTION_DOWN);
            queue.push({ x: popped.x, y: popped.y + 1, moves: tempMoves });
        }
        return queue;
    }
    changeAnimation(){
        this.currentFrame  = (this.currentFrame == this.frameCount) ? 1 : this.currentFrame + 1;
    }
    draw(){
        context.save();
        // context.translate(this.x+oneBlockSize/2,this.y+oneBlockSize/2);
        // context.rotate((this.direction*90*Math.PI)/180);

        // context.translate(-this.x - oneBlockSize/2, - this.y - oneBlockSize/2);

        context.drawImage(ghostContext,this.imageX,this.imageY,this.imageWidth,this.imageHeight,this.x,this.y,this.width,this.height);
        context.restore();

        context.beginPath();
        context.strokeStyle = "red";
        context.arc(this.x + oneBlockSize/2, this.y + oneBlockSize/2, this.range*oneBlockSize,0,2* Math.PI);
        context.stroke();
    }

    getMapX(){
        return parseInt(this.x/oneBlockSize);
    }
    getMapY(){
        return parseInt(this.y/oneBlockSize);
    }
    getMapXRight(){
        return parseInt((this.x + 0.9999*oneBlockSize)/oneBlockSize);
    }
    getMapYRight(){
        return parseInt(( this.y + 0.9999*oneBlockSize)/oneBlockSize);
    }
}

