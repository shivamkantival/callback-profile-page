import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function InputComponent(props) {
    let totalInput = null;

    const handleSave = () => {
        props.handleSave(totalInput.value);
    }

    const keystroke = (event) => {
        if(event.keyCode === 13)
            handleSave();
    }

    return (
        <div className="container input-component" onKeyUp={keystroke} >
            <div className="half" >
                Total Profiles:    <input type="number" ref={input => {totalInput = input}} style={{width: `70%` }} />
            </div>
            <button type="button" onClick={handleSave} className="five" >Save</button>
        </div>
    )
}

function Head(props) {
    return(
        <div className="header" >
            <p>Profile Page</p>
        </div>
    )
}

function Card(props) {
    const {name, email, image} = props.card;
    return (
        <div className="container card wrap" >
            <div style={{"margin-bottom": "10px"}}>
                <img src={image} alt={name} style={{width: `auto` }} className="image" />
            </div>
            <div className="card__hidden" >
                <div className="card__name" >
                    {name}
                </div>
                <div>
                    {email}
                </div>
            </div>
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

    appendCard = (response) => {
        return new Promise(resolve => {
            const {email, name: {first, last}, picture:{medium: image}} = JSON.parse(response).results[0];
            const {cardsArray} = this.state
            cardsArray.push({
                email,
                name: first + " " +last,
                image,
            });
            this.setState({
                cardsArray,
            });
            resolve();
        })
        
    }

    getCardDetail = () => {
        return new Promise((resolve, reject) => {
            const xmlHttp = new XMLHttpRequest();
            const url = 'https://randomuser.me/api';
            xmlHttp.onreadystatechange = function() { 
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                {
                    resolve(xmlHttp.responseText);
                }
                else if(xmlHttp.readyState === 4){
                    reject();
                }
            }
            xmlHttp.open("GET", url, true);
            xmlHttp.send(null);
        });
    }

    drawCards = counter => {
        let cardsDrawn = 0;
        const self = this;
        let getElement;
        return getElement = () => {
            self.getCardDetail().then(response => {
                counter--;
                cardsDrawn++;
                return self.appendCard(response);
            }).then(() => {
                if(counter){
                    window.setTimeout(getElement, 300);
                }
                else {
                    self.props.handleSuccess(cardsDrawn);
                }
            }).catch(() => {
                self.props.handleSuccess(cardsDrawn);
            })
        }
    }

    componentWillReceiveProps = nextProp => {
        let {newCardsOrdered} = nextProp;
        newCardsOrdered = parseInt(newCardsOrdered, 10);
        if(newCardsOrdered > 0) {
            (this.drawCards(newCardsOrdered))();
        }
    }

    render() {
        return(
            <div className="container wrap" >
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

    handleSave = (newTotal) => {
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
                <InputComponent handleSave={this.handleSave} />
                <CardHolder newCardsOrdered={this.state.newCardsOrdered} numPerRow='4' handleSuccess={this.handleSuccess} />
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
