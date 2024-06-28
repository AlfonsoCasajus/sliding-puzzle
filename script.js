const rows = 4;
const columns = 4;


let emptyTile;

const imageOrder = ['1', '2','3','4','5','6','7','8', '9','10','11','12','13','14','15','16']

window.onload = function() {
    document.getElementById('restart').addEventListener("click", restartGame); 
    createTiles();
}

function createTiles() {
    // For testing puposes comment line 18 of code
    // And uncomment line 10
    // The win will be 2 moves away
    const startingOrder = shuffleArray(imageOrder);
    // const startingOrder = [...imageOrder];


    // First image is always going to be the starting hidden tile
    // So we push it to the end and then we hide it
    const indexOfFirstImage = startingOrder.indexOf('16');
    startingOrder.splice(indexOfFirstImage, 1);
    startingOrder.push('16')

    for(let row = 0; row < rows; row++) {
		for(let col = 0; col < columns; col++) {
         	const tile = document.createElement("img");
            const currentImgSrc = startingOrder.shift();

			// El ID es utilizado para corroborar que se esta moviendo a una posicion adyacente 
			tile.id = `${row.toString()}${col.toString()}`;
            tile.src = `assets/puzzle/${currentImgSrc}.jpg`;
            tile.classList.add('tile')
            tile.classList.add(`img-${currentImgSrc}`)

            document.getElementById('board').append(tile);

            tile.addEventListener("click", clickTile);

            // Set and hide empty tile
            if(row === rows -1 && col === columns - 1) {
               tile.classList.add('hidden');
               emptyTile = tile;
           };

           anime({
                targets: ['.tile'],
                scale: [
                    {value: .1, easing: 'easeOutSine', duration: 250},
                    {value: 1, easing: 'easeInOutQuad', duration: 250}
                ],
                delay: anime.stagger(10)
            });

		}
	}

     // Hide end game message
     handleEndGameMessage(false);
     const infoMessage = document.getElementById('info-wrapper')
     infoMessage.style.opacity = 0;
     infoMessage.style.pointerEvents = 'none';
}
function deleteTiles() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.remove());
}
function restartGame() {
    anime({
        targets: '#restart',
        rotate: 180,
        duration: 250,
        loop: false,
        easing: 'easeOutElastic',
        lasticity: 600,
        complete: () => {
            anime.set('#restart', { rotate: 0 });
            deleteTiles();
            createTiles();
        }
      });
}

function shuffleArray(originalArray) {
    const array = [...originalArray];

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}
async function clickTile() {
    const currentRow = parseInt(this.id[0]);
    const currentCol = parseInt(this.id[1]);
    
    const emptyRow = parseInt(emptyTile.id[0])
    const emptyCol = parseInt(emptyTile.id[1])

    // Chek if clicked tile is next to the empty one;
    const moveUp = currentRow === (emptyRow + 1) && currentCol === emptyCol;
    const moveLeft = currentRow === emptyRow && currentCol === (emptyCol + 1);
    const moveRight = currentRow === emptyRow && currentCol === (emptyCol - 1);
    const moveDown = currentRow === (emptyRow - 1) && currentCol === emptyCol;

    const shouldMove = moveUp || moveLeft || moveRight || moveDown;

    if (shouldMove) swapAnimation(this, emptyTile);
}

function swapAnimation(tile1, tile2) {
    const rect1 = tile1.getBoundingClientRect();
    const rect2 = tile2.getBoundingClientRect();
    
    const deltaX = rect2.x - rect1.x;
    const deltaY = rect2.y - rect1.y;

   anime({
        targets: tile1,
        translateX: deltaX,
        translateY: deltaY,
        duration: 250,
        easing: 'linear',
        complete: () => {
            // Animation to take tile to correct displacement
            anime({
                targets: tile1,
                translateX: 0,
                translateY: 0,
                duration: 0
            });
            // When animation ends it switch both Dom Element tiles
            swapDomElements(tile1, tile2);
        }
    });
}

function swapDomElements(el1, el2) {
    const parent = el1.parentNode;

    // Create clones to mantain original positions
    const el1Clone = el1.cloneNode(true);
    const el2Clone = el2.cloneNode(true);

    // Switch tiles IDs
    el1Clone.id = el2.id;
    el2Clone.id = el1.id;

    // Add once again the event listeners for each element
    el1Clone.addEventListener("click", clickTile);
    el2Clone.addEventListener("click", clickTile);

    // Reemplace elements with clones
    parent.replaceChild(el2Clone, el1);
    parent.replaceChild(el1Clone, el2);

    // Update new empty tile
    emptyTile = el2Clone;

    checkWin();
}

// Checks if all the tiles are in the correct position
function checkWin() {
    const tiles = document.querySelectorAll('.tile');
    let correctTiles = 0;
    tiles.forEach((tile, index) => {
        const imgSrcNumber = parseInt(tile.classList[1].split('-')[1]);
        if (imgSrcNumber === index + 1) correctTiles++;
    })
    
    if (correctTiles === 16) endGame()
}

function endGame() {
    const hiddenPiece = document.getElementsByClassName('hidden')[0];
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.removeEventListener('click', clickTile);
        tile.style.pointerEvents = 'none';
    });
    hiddenPiece.classList.remove('hidden');

    // Show end game message
    handleEndGameMessage(true)
    anime({
        targets: '.tile',
        translateX: () => anime.random(-300, 300),
        translateY: () => anime.random(-300, 300),
        rotate: () => anime.random(-360, 360), 
        scale: () =>  anime.random(0.5, 2),
        opacity: 0,
        easing: 'easeOutExpo',
        duration: 2000,
        delay: anime.stagger(100),
        complete: () => {
            deleteTiles();
        }
    });
}

function handleEndGameMessage(showMessage = true) {
    const infoMessage = document.getElementById('info-wrapper')

    if (showMessage){
        infoMessage.style.opacity = 1;
        infoMessage.style.pointerEvents = 'auto';
    }
    else {
        infoMessage.style.opacity = 0;
        infoMessage.style.pointerEvents = 'none';
    }
}