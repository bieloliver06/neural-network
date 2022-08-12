const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;

const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road=new Road(carCanvas.width/2,carCanvas.width*0.9, 3);

const N=800;
const cars=generateCars(N);
let bestCar=cars[0]

if(localStorage.getItem("bestBrain")){
    for(let i=0; i<cars.length; i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain")
        );
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.2);
        }
    }
}



const traffic=[
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2,getRandomColor())
];

generateRandomTraffic();

animate();

function generateRandomTraffic() {
    let random = 0;
    let higher_or_lower = 0;
    let lanes = 0;
    let lastCoord = -700;
    for(let i=0; i<50; i++) {
        random = Math.random()*2;
        if(random == 0) {
            traffic.push(new Car(road.getLaneCenter(Math.random() * 3), lastCoord - 200, 30, 50,"DUMMY",2,getRandomColor()));
            lastCoord -= 200;
        } else {
            lanes = Math.random()*3;
            higher_or_lower = Math.random()*2;
            if(lanes == 0) {
                traffic.push(new Car(road.getLaneCenter(lanes), lastCoord - 200, 30, 50, "DUMMY", 2, getRandomColor()));
                traffic.push(new Car(road.getLaneCenter(Math.random()*2 + 1), lastCoord - 200, 30, 50, "DUMMY", 2, getRandomColor()));
                lastCoord -= 200;
            } if(lanes == 1) {
                traffic.push(new Car(road.getLaneCenter(lanes), lastCoord - 200, 30, 50, "DUMMY", 2, getRandomColor()));
                if(higher_or_lower == 0) {
                    traffic.push(new Car(road.getLaneCenter(lanes - 1), lastCoord - 200, 30, 50, "DUMMY", 2, getRandomColor()));
                    lastCoord -= 200;
                } else {
                    traffic.push(new Car(road.getLaneCenter(lanes + 1), lastCoord - 200, 30, 50, "DUMMY", 2, getRandomColor()));
                    lastCoord -= 200;
                }
            } else {
                traffic.push(new Car(road.getLaneCenter(lanes), lastCoord - 200, 30, 50, "DUMMY", 2, getRandomColor()));
                traffic.push(new Car(road.getLaneCenter(Math.random() * 2), lastCoord - 200, 30, 50, "DUMMY", 2, getRandomColor()));
                lastCoord -= 200;
            }
        }
    }
}

function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N) {
    const cars=[];

    for(let i=1; i<=N; i++) {
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI",3))
    }
    return cars;
}

function animate(time){
    for(let i=0; i<traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for(let i=0; i<cars.length; i++){
        cars[i].update(road.borders, traffic);
    }
    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    bestCar = cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0; i<traffic.length; i++) {
        traffic[i].draw(carCtx,"#db482e");
    }

    carCtx.globalAlpha=0.2;

    for(let i=0; i<cars.length; i++) {
        cars[i].draw(carCtx, "#2ebed1");
    }

    carCtx.globalAlpha=1;
    bestCar.draw(carCtx, "#2ebed1", true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;

    Visualizer.drawNetwork(networkCtx, cars[0].brain);

    requestAnimationFrame(animate);
}