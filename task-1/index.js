let integers = [1, 10, 2, 6, 5, 3, 4]

const findHighestProduct = (input) => {
    let sortedArr = []
    let sum = 1

    for (let i=0; i<input.length; i++){
        sortedArr.push(i) 
        if(sortedArr.length > 3){
            sortedArr.sort(function(a, b) {return input[b] - input[a]})
            sortedArr.pop()
        }
    }

    for(let i=0; i<sortedArr.length; i++){
        sum = sum * integers[sortedArr[i]]
    }
    return sum
}


console.log(findHighestProduct(integers))