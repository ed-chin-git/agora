import { useState,
        useEffect,
           useRef } from "react";
import { ethers } from "ethers";
import Identicon from 'identicon.js'
import { Button, Card, Row, Col } from "react-bootstrap";

/* Home page component  (pass in smart contract) */
export default function Home ({ contract }) {
    //  __ stateful vars __
    const audioFileRef = useRef([])
    const [isPlaying, setIsPlaying] = useState(null)
    const [MarketList, setMarketList] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(0)
    const [previous, setPrevious] = useState(null)
    const loadMarketList = async () => {
        // get listed items from blockchain
        const results = await contract.getAllUnsoldTokens()
        const forSaleList = await Promise.all(results.map(async i => {
            // i = i.args  // crashes without this ???
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
            
            // and return complete item
            let item_List = {
                price: i.price,
                itemId: i.tokenId,
                name: metadata.name,
                audio: metadata.audio,
                identicon,
            }
            return (item_List)
        }))
        setMarketList(forSaleList)
        setLoading(false)
    }

    /* func: buyMarketItem */
    const buyMarketItem = async (item) => {
        await(await contract.buyToken(item.itemId, { value: item.price })).wait()
        loadMarketList()
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
        !MarketList && loadMarketList()   // only load when component mounts (if value is null)
    })
    
    /* ___ Return HTML ___    */
    if (loading) return (
        // ___ loading message ___
        <main style={{ padding: "1rem 0"}}>
            <h3>Loading songs ...</h3>
        </main>
    );
    return (
        // ___ page elements ___
        <div className="flex justify-center">
            <h2 variant='secondary' style={{bg:"gold"}}>Songs for Sale</h2>
            {MarketList.length > 0 ?
                <div className="px-5 container">
                    <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {MarketList.map((item, idx) => ( 
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
                                    <div className="d-grid my-1" >
                                        <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg" >
                                            {`Buy for ${ethers.utils.formatEther(item.price)} ETH`}
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                    </Row>
                </div>
            : (
                <main style={{ padding: "1rem 0"}}>
                    <h2>No songs for sale.</h2>
                </main>
            )}
        </div>
    );
}
