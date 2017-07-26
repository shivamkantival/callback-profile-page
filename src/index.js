import React from 'react';
import ReactDOM from 'react-dom';
import update from 'immutability-helper';
import './index.css';
import Promise from 'bluebird';
Promise.config({cancellation: true});

function InputComponent(props) {
    let rowNum = null;
    let colNum = null;

    const handleSave = () => {
        props.handleSave(rowNum.value, colNum.value);
    }

    const keystroke = (event) => {
        if(event.keyCode === 13)
            handleSave();
    }

    return (
        <div className="container input-component" onKeyUp={keystroke} >
            <div className="half" >
                Number of rows :    <input type="number" ref={input => {rowNum = input}} style={{width: `40%` }} />
            </div>
            <div className="half" >
                Nmber of columns :    <input type="number" ref={input => {colNum = input}} style={{width: `40%` }} />
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

class Card extends React.PureComponent {

    render() {
        const {name, email, image} = this.props.card;
        const cardWidth = Math.floor(100/this.props.columns);
        return (
            <div className="container card wrap" style={{width:`${cardWidth}%`}} >
                <div style={{"marginBottom": "10px"}}>
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
    
}

class CardHolder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardsArray: [],
        };
        this.makeCard = this.makeCard.bind(this);
        this.runningPromise = Promise.resolve();
        this.cardDrawn = 0;
    }

    appendCard = (response) => {
        return new Promise(resolve => {
            const {email, name, picture} = JSON.parse(response).results[0];
            const newObj = {
                                email,
                                name: name.first + " " + name.last,
                                image: picture.medium,
                            };
            const newState = update(this.state, {
                cardsArray:{$push: [newObj]}
            });
            this.setState(newState);
            resolve();
        })
        
    }

    getCardDetail = () => {
        return new Promise((resolve, reject, onCancel) => {
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
            onCancel (() => xmlHttp.abort());
        });
    }

    drawCards = counter => {
        const self = this;
        let getElement;
        return getElement = () => {
            console.log('fetching');
            this.runningPromise  = self.getCardDetail()
            .then(response => {
                return self.appendCard(response);
            })
            .then(() => {
                this.cardDrawn++;
                console.log(counter, this.cardDrawn)
                if(counter > this.cardDrawn){
                    window.setTimeout(getElement, 300);
                }
                else {
                    self.props.handleSuccess(this.cardDrawn);
                    this.cardDrawn= 0;
                }
            })
            .catch(Promise.CancellationError, function (err) {
                console.log('CANCEL REPLY')
                console.log(err);
            })
            .catch(() => {
                self.props.handleSuccess(this.cardDrawn);
                this.cardDrawn = 0;
            });
        }
    }

    componentWillReceiveProps = nextProp => {
        let {newCardsOrdered} = nextProp;
        newCardsOrdered = parseInt(newCardsOrdered, 10);
        if(newCardsOrdered > 0 ) {
            this.runningPromise.cancel();
            (this.drawCards(newCardsOrdered))();
        }
    }

    makeCard(cardDetail) {
        return <Card key={cardDetail.email} card={cardDetail} columns={this.props.numPerRow} />;
    }

    render() {
        return(
            <div className="container wrap" >
                {this.state.cardsArray.map( this.makeCard )}
            </div>
        )
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state =  {
            displayedCardTotal: 0,
            columns: 0,
            newCardsOrdered: 0,
            rows: 0,
        }
    }

    handleSave = (rowNum, colNum) => {
        const {displayedCardTotal} = this.state;
        const newTotal = parseInt(rowNum, 10)*parseInt(colNum, 10);
        if(displayedCardTotal < newTotal) {
            this.setState({
                newCardsOrdered: (parseInt(rowNum, 10)*parseInt(colNum, 10)) - displayedCardTotal,
                columns: colNum,
                rows: rowNum,
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
        const {newCardsOrdered, columns} = this.state;
        return(
            <div>
                <Head />
                <InputComponent handleSave={this.handleSave} />
                <CardHolder newCardsOrdered={newCardsOrdered} numPerRow={columns} handleSuccess={this.handleSuccess} />
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
