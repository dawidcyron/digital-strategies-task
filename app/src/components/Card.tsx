const Card = (props: any) => {
    return (
        <div className="card">
            <div className="card-image is-4by3">
                <img src={props.imgUrl}></img>
            </div>
            <div className="card-content">
                <div className="media">
                    <div className="media-content">
                        <p className="title is-4">{props.name}</p>
                    </div>
                </div>
                <div className="content">
                    {props.description}
                </div>
            </div >
            <footer className="card-footer">
                {props.level == 1 ? <button className="card-footer-item button" onClick={() => props.upgradeFunction(props.tokenId)}>Level up</button> : <button className="card-footer-item" disabled>Already leveled up</button>}
            </footer>
        </div >
    )
}

export default Card;