import { useState,
        useEffect,
           useRef } from "react";
// import { ethers } from "ethers";
import Identicon from 'identicon.js'
import { ButtonGroup, Button, Card } from "react-bootstrap";

/* webpage component  (pass in smart contract) */
const MyResales = ({ contract, account }) => {
    //  __ stateful vars __
    const audioRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(null)
    const [currentItemIndex, setCurrentItemIndex] = useState(0)
    const [myTokens, setMyTokens] = useState(null)
    const [loading, setLoading] = useState(true)
    const loadMyTokens = async () => {
        // get listed items
        // const filter = contract.filters
        let filter = contract.filters.MarketItemRelisted(null, account, null)
        let results = await contract.queryFilter(filter)

        const myTokens = await Promise.all(results.map(async i => {
            i = i.args  // crashes without this ???
            const uri = await contract.tokenURI(i.tokenId) // get uri from contract
            const response = await fetch(uri + ".json")
            const metadata = await response.json()
            var options = {
                foreground: [0, 0, 0, (255 - i.tokenId)],               // rgba black
                background: [255, 255, 255, 255],         // rgba white
                margin: 0.2,                              // 20% margin
                size: 420,                                // px square
                format: 'png'                             // use SVG instead of PNG
              };
            const identicon = `data:image/png;base64,${new Identicon(metadata.name + metadata.price, options).toString()}`
            metadata.audio = 'https://'+metadata.audio   // add prefix to complete url
            // and return them
            let item = {
                price: i.price,
                itemId: i.tokenId,
                name: metadata.name,
                audio: metadata.audio,
                identicon,
            }
            return (item)
        }))
        setMyTokens(myTokens)  // init the item list
        setLoading(false)
    }

    /* func: skipSong  
    (true) to go forwards 
    (false) to go backwards */
    const skipSong = (forwards) => {
        if (forwards) {
            setCurrentItemIndex( () => {
                let index = currentItemIndex
                index++
                if(index > myTokens.length - 1) {
                    index =0}
                return index
            })
        } else {
            setCurrentItemIndex( () => {
                let index = currentItemIndex
                index--
                if(index < 0) {
                    index = myTokens.length - 1}
                return index
            })
        }
    } 

    /* ___ effects hooks___  
    useEffect(callback) executes when this component updates 
    (each time  the stateful vars change or component melts) */ 
    useEffect ( () => {
        if (isPlaying) {
            audioRef.current.play()
        } else if (isPlaying != null) {
            audioRef.current.pause()
        }
    })
    useEffect( () => {
        !myTokens && loadMyTokens()   // only load when component mounts (if value is null)
    })
    
    /* ___ Return HTML ___    */
    if (loading) return (
        // ___ loading message ___
        <main style={{ padding: "1rem 0"}}>
            <h2>Loading ....</h2>
        </main>
    );
    return (
        // ___ page elements ___
        <div className="container-fluid mt-5">
            {myTokens.length > 0 ?
                <div className="row">
                    <main role="main" className="col-lg-12 mx-auto" style={{ maxwidth: '500px'}} >
                        <div className="content mx-auto">
                            <audio src={myTokens[currentItemIndex].audio} ref={audioRef} ></audio>
                            <Card style={{ maxWidth: '30rem' }}>
                                <Card.Header> {currentItemIndex + 1} of {myTokens.length} </Card.Header>
                                <Card.Img variant="top" src={myTokens[currentItemIndex].identicon}/>
                                <Card.Body color="secondary">
                                    <Card.Title as="h2"> {myTokens[currentItemIndex].name}  </Card.Title>
                                    <div className="d-grid px-4" >
                                        <ButtonGroup>
                                            <Button variant="secondary" onClick={() => skipSong(false)} >
                                                <img src="icons8-prev-48.png" alt='prev'></img>    
                                            </Button>
                                            <Button variant="secondary" onClick={() => setIsPlaying(!isPlaying)}>
                                                {isPlaying ? (
                                                    <img src="icons8-pause-48.png" alt='pause'></img>    
                                                ) : (
                                                    <img src="icons8-play-48.png" alt='play'></img>    
                                                )}
                                            </Button>
                                            <Button variant="secondary" onClick={() => skipSong(true)} >
                                                <img src="icons8-next-48.png" alt="next" ></img>    
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </main>
                </div>
            : (
                <main style={{ padding: "1rem 0"}}>
                    <h2>You don't have any songs listed for sale. </h2>
                </main>
            )}
        </div>
    );
}
export default MyResales