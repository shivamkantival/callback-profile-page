import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function InputComponent(props) {
    let rowInput = null;
    let totalInput = null;

    const handleSave = () => {
        props.handleSave(totalInput.value, rowInput.value);
    }

    return (
        <div>
            <div>
                Profiles per row
                <input type="number" ref={input => {rowInput = input}} />
            </div>
            <div>
                Total Profiles
                <input type="number" ref={input => {totalInput = input}} />
            </div>
            <button type="button" onClick={handleSave} >Save</button>
        </div>
    )
}

function Head(props) {
    return(
        <div>
            <p>Profile Page</p>
        </div>
    )
}

function Card(props) {
    const {name, email, image} = props.card;
    return (
        <div>
            <div>
                {name}
            </div>
            <div>
                {email}
            </div>
            <img src={image} />
        </div>
    );
}

class CardHolder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardsArray: [],
        };
    }

    appendCard = (response, newCardsOrdered, cardsDrawn, failedRequests) => {
        const {email, name: {first, last}, picture:{medium: image}} = JSON.parse(response).results[0];
        const {cardsArray} = this.state
        cardsArray.push({
            email,
            name: first + last,
            image,
        });
        this.setState({
            cardsArray,
        });
        this.drawCards(newCardsOrdered, cardsDrawn, failedRequests, this.appendCard);
    }

    drawCards = (newCardsOrdered, cardsDrawn, failedRequests, callback) => {
        if(newCardsOrdered){
            const xmlHttp = new XMLHttpRequest();
            const url = 'https://randomuser.me/api';
            xmlHttp.onreadystatechange = function() { 
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                {
                    callback(xmlHttp.responseText, newCardsOrdered - 1, cardsDrawn + 1, 0);
                }
                else if(xmlHttp.readyState === 4){
                    if(failedRequests === 3){
                        this.showError();
                        this.props.handleSuccess(cardsDrawn);
                    }
                    else {
                        this.props.handleSuccess(cardsDrawn);
                    }
                }
            }
            xmlHttp.open("GET", url, true); // true for asynchronous 
            xmlHttp.send(null);
        }
        else{
            this.props.handleSuccess(cardsDrawn);
        }
    }


    componentWillReceiveProps = nextProp => {
        let {newCardsOrdered} = nextProp;
        newCardsOrdered = parseInt(newCardsOrdered, 10);
        if(newCardsOrdered > 0) {
            this.drawCards(newCardsOrdered, 0 , 0, this.appendCard);
        }
    }

    render() {
        return(
            <div>
                {this.state.cardsArray.map( cardDetail => <Card key={cardDetail.email} card={cardDetail} /> )}
            </div>
        )
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state =  {
            displayedCardTotal: 0,
            numPerRow: 0,
            newCardsOrdered: 0,
        }
    }

    handleSave = (newTotal, newPerRow) => {
        const {displayedCardTotal} = this.state;
        if(displayedCardTotal < newTotal) {
            this.setState({
                newCardsOrdered: parseInt(newTotal, 10) - displayedCardTotal,
            })
        }
    }

    handleSuccess = renderSuccess => {
        const {displayedCardTotal} = this.state;
        this.setState({
            displayedCardTotal: displayedCardTotal + parseInt(renderSuccess, 10),
            newCardsOrdered: 0,
        })
    }

    render() {
        return(
            <div>
                <Head />
                <InputComponent handleSave={this.handleSave}/>
                <CardHolder newCardsOrdered={this.state.newCardsOrdered} numPerRow='4' handleSuccess={this.handleSuccess} />
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
