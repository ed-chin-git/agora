import { useState,
        useEffect,
           useRef } from "react";
import { ethers } from "ethers";
import Identicon from 'identicon.js'
import { ButtonGroup, Button, Card, Form, InputGroup } from "react-bootstrap";

/* webpage component  (pass in smart contract) */
const MyTokens = ({ contract }) => {
    //  __ stateful vars __
    const audioFileRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(null)
    const [currentItemIndex, setCurrentItemIndex] = useState(0)
    const [myTokens, setMyTokens] = useState(null)
    const [loading, setLoading] = useState(true)
    const [resaleId, setResaleId] = useState(null)
    const [resalePrice, setResalePrice] = useState(null)
    const loadMyTokens = async () => {
        // get owned items
        const results = await contract.getMyTokens()
        const myTokens = await Promise.all(results.map(async i => {
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
                resellPrice: null
            }
            return (item)
        }))
        setMyTokens(myTokens)  // init the item list
        setLoading(false)
    }

    /* func: resellItem */
    const resellItem = async (item) => {
      if (resalePrice === "0" || item.itemId !== resaleId || !resalePrice) return 
      // get royalty fee 
      const fee = await contract.royaltyFee()
      const price = ethers.utils.parseEther(resalePrice.toString())
      await(await contract.relistToken(item.itemId, price, {value: fee})).wait()
      loadMyTokens()
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

    /* ___ effects ___  
    useEffect(callback) executes when this component updates 
    (each time  the stateful vars change or component melts) */ 
    useEffect ( () => {
        if (isPlaying) {
            audioFileRef.current.play()
        } else if (isPlaying != null) {
            audioFileRef.current.pause()
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
            <h2>My Library</h2>
            {myTokens.length > 0 ?
                <div className="row">
                    <main role="main" className="col-lg-12 mx-auto" style={{ maxwidth: '500px'}} >
                        <div className="content mx-auto">
                            <audio src={myTokens[currentItemIndex].audio} ref={audioFileRef} ></audio>
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
                                <Card.Footer>
                                  <InputGroup className="my-1">
                                      <Button onClick={() => resellItem(myTokens[currentItemIndex])} variant='outline-primary' id='button-addon1'>
                                        Resell
                                      </Button>
                                      <Form.Control
                                        onChange={(e) => {
                                          setResaleId(myTokens[currentItemIndex].itemId)
                                          setResalePrice(e.target.value)
                                        }} 
                                        size='md'
                                        value={resaleId === myTokens[currentItemIndex].itemId  ? resalePrice : ''}
                                        required type="number"
                                        placeholder="Price in ETH"
                                      />
                                  </InputGroup>
                                </Card.Footer>
                            </Card>
                        </div>
                    </main>
                </div>
            : (
                <main style={{ padding: "1rem 0"}}>
                    <h2>You don't own any songs yet!  Go to 'Buy Music' and check out what's for sale.</h2>
                </main>
            )}
        </div>
    );
}
export default MyTokens