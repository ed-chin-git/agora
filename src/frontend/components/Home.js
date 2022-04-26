import { useState,
        useEffect,
           useRef } from "react";
import { ethers } from "ethers";
import Identicon from 'identicon.js'
import { ButtonGroup, Button, Card } from "react-bootstrap";

/* Home page component  (pass in smart contract) */
const Home = ({ contract }) => {
    //  __ stateful vars __
    const audioRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(null)
    const [currentItemIndex, setCurrentItemIndex] = useState(0)
    const [marketItems, setMarketItems] = useState(null)
    const [loading, setLoading] = useState(true)
    const loadMarketItems = async () => {
        console.log('setLoading called...')
        // get all unsold items
        const results = await contract.getAllUnsoldTokens()
        const marketItems = await Promise.all(results.map(async i => {
            const uri = await contract.tokenURI(i.tokenId) // get uri from contract
            const response = await fetch(uri + ".json")
            const metadata = await response.json()
            const identicon = `data:image/png;base64,${new Identicon(metadata.name + metadata.price, 330).toString()}`
            // and return them
            return ({
                price: i.price,
                itemId: i.tokenId,
                name: metadata.name,
                audio: metadata.audio,
                identicon
            })
        }))
        setMarketItems(marketItems)  // init the item list
        setLoading(false)
    }

    /* func: buyMarketItem */
    const buyMarketItem = async (item) => {
        await(await contract.buyToken(item.itemId, { value: item.price })).wait()
        loadMarketItems()
    }

    /* func: skipSong  
    (true) to go forwards 
    (false) to go backwards */
    const skipSong = (forwards) => {
        if (forwards) {
            setCurrentItemIndex( () => {
                let index = currentItemIndex
                index++
                if(index > marketItems.length - 1) {
                    index =0}
                return index
            })
        } else {
            setCurrentItemIndex( () => {
                let index = currentItemIndex
                index--
                if(index < 0) {
                    index = marketItems.length - 1}
                return index
            })
        }
    } 

    /* ___ effects ___  
    useEffect(callback) executes when this component updates 
    (each time  the stateful vars change or component melts) */ 
    useEffect ( () => {
        console.log(audioRef)
        // console.log(audioRef.current.play)
        
        if (isPlaying) {
            console.log(audioRef)
            audioRef.current.baseURI = 'https://'
            audioRef.current.play()
        } else if (isPlaying != null) {
            audioRef.current.pause()
        }
    })
    useEffect( () => {
        !marketItems && loadMarketItems()   // only load when component mounts (if value is null)
    })
    
    /* ___ HTML ___    */
    if (loading) return (
        <main style={{ padding: "1rem 0"}}>
            <h2>Loading ....</h2>
        </main>
    );
    return (
        // ___ home page ___
        <div className="container-fluid mt-5">
            {marketItems.length > 0 ?
                <div className="row">
                    <main role="main" className="col-lg-12 mx-auto" style={{ maxwidth: '500px'}} >
                        <div className="content mx-auto">
                            <audio src={marketItems[currentItemIndex].audio} ref={audioRef} ></audio>
                            <Card>
                                <Card.Header> {currentItemIndex + 1} of {marketItems.length} </Card.Header>
                                <Card.Img variant="top" src={marketItems[currentItemIndex].identicon}/>
                                <Card.Body color="secondary">
                                    <Card.Title as="h2"> {marketItems[currentItemIndex].name}  </Card.Title>
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
                                <Card.Footer>
                                    <div className="d-grid my-1" >
                                        <Button onClick={() => buyMarketItem(marketItems[currentItemIndex])} variant="primary" size="lg" >
                                            {`Buy for ${ethers.utils.formatEther(marketItems[currentItemIndex].price)} ETH`}
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </div>
                    </main>
                </div>
            : (
                <main style={{ padding: "1rem 0"}}>
                    <h2>No song listings</h2>
                </main>
            )}
        </div>
    );
}
export default Home

// https://youtu.be/Q_cxytZZdnc?t=4994