import { useState,
        useEffect,
           useRef } from "react";
import { ethers } from "ethers";
import Identicon from 'identicon.js'
import { Button, Card, Form, InputGroup, Row, Col } from "react-bootstrap";

/* webpage component  (pass in smart contract) */
export default function MyTokens ({ contract }) {
    //  __ stateful vars __
    const audioFileRef = useRef([])
    const [isPlaying, setIsPlaying] = useState(null)
    // const [currentItemIndex, setCurrentItemIndex] = useState(0)
    const [myTokens, setMyTokens] = useState(null)
    const [loading, setLoading] = useState(true)

    const [selected, setSelected] = useState(0)
    const [previous, setPrevious] = useState(null)

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

    /* ___ effects ___  
    useEffect(callback) executes when this component updates 
    (each time  the stateful vars change or component melts) */ 
    useEffect ( () => {
        if (isPlaying) {
            audioFileRef.current[selected].play()
            if (selected !== previous) audioFileRef.current[previous].pause()
        } else if (isPlaying !== null) {
            audioFileRef.current[selected].pause()
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
        <div className="flex justify-center">
            <h2>My Library</h2>
            {myTokens.length > 0 ?
                <div className="px-5 container">
                    <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {myTokens.map((item, idx) => ( 
                        <Col key={idx} className='overflow-hidden'>
                            <audio src={item.audio} key={idx} ref={el => audioFileRef.current[idx] =el}></audio>
                            <Card>
                                <Card.Img variant="top" src={item.identicon}/>
                                <Card.Body color="secondary">
                                    <Card.Title as="h2">{item.name}</Card.Title>
                                    <div className="d-grid px-4" >
                                        <Button variant="secondary" onClick={() => {
                                            setPrevious(selected)
                                            setSelected(idx)
                                            if (!isPlaying || idx === selected) setIsPlaying(!isPlaying)
                                        }}>
                                            { isPlaying && selected === idx ? (    
                                                <img src="icons8-pause-48.png" alt='pause'></img>    
                                                            ) : (
                                                <img src="icons8-play-48.png" alt='play'></img>    
                                        )}
                                        </Button>
                                    </div>
                                    <Card.Text className="mt-1">
                                        {ethers.utils.formatEther(item.price)} ETH
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer>
                                    <InputGroup className="my-1">
                                        <Button onClick={() => resellItem(item)} variant='outline-primary' id='button-addon1'>
                                        Resell 
                                        </Button>
                                        <Form.Control
                                        onChange={(e) => {
                                            setResaleId(item.itemId)
                                            setResalePrice(e.target.value)
                                        }} 
                                        size='md'
                                        value={resaleId === item.itemId  ? resalePrice : ''}
                                        required type="number"
                                        placeholder="Price in ETH"
                                        />
                                    </InputGroup>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                    </Row>
                </div>
            : (
                <main style={{ padding: "1rem 0"}}>
                    <h2>You don't own any songs yet!  Go to 'Buy Music' and check out what's for sale.</h2>
                </main>
            )}
        </div>
    );
}
