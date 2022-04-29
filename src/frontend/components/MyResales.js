import { useState,
        useEffect,
           useRef } from "react";
import { ethers } from "ethers";
import Identicon from 'identicon.js'
import { Button, Card, Row, Col } from "react-bootstrap";

/* webpage component  (pass in smart contract) */
export default function MyResales ({ contract,account }) {
    //  __ stateful vars __
    const audioFileRef = useRef([])
    const [isPlaying, setIsPlaying] = useState(null)
    const [myTokens, setMyTokens] = useState(null)
    const [soldItems, setSoldItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(0)
    const [previous, setPrevious] = useState(null)
    const loadMyTokens = async () => {
        // get relisted items for account from blockchain
        let filter = contract.filters.MarketItemRelisted(null, account, null)
        let results = await contract.queryFilter(filter)
        const resaleList = await Promise.all(results.map(async i => {
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
        setMyTokens(resaleList)
        // Fetch sold resale items : query MarketItemBought events w/seller = user
        filter = contract.filters.MarketItemBought(null, account, null, null)
        results = await contract.queryFilter(filter)
        // filter out sold items from listed items
        const filteredItems = resaleList.filter( i => results.some(j => i.itemId.toString() === j.args.tokenId.toString() ))
        setSoldItems(filteredItems)  //%EDC%
        setLoading(false)
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
            <h1>My Listings</h1>
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
                            </Card>
                        </Col>
                    ))}
                    </Row>
                    <>
                      <h1>Sold</h1>
                      {soldItems.length > 0 ?
                        <Row xs={1} md={2} lg={4} className="g-4 py-5">
                        {soldItems.map((item, idx) => ( 
                            <Col key={idx} className='overflow-hidden'>
                                <Card>
                                    <Card.Img variant="top" src={item.identicon}/>
                                    <Card.Body color="secondary">
                                        <Card.Title as="h2">{item.name}</Card.Title>
                                        <Card.Text className="mt-1">
                                            {ethers.utils.formatEther(item.price)} ETH
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                        </Row>
                        : (
                          <main style={{ padding: "1rem 0"}}>
                            <h2>No sold songs</h2>
                          </main>
                          )
                      }
                    </>
                </div>
            : (
                <main style={{ padding: "1rem 0"}}>
                    <h2>You don't have any songs for sale.</h2>
                </main>
            )}
        </div>
    );
}
