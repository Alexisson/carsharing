class Cars extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataReturned: 0,
      data: [],
      cars: [],
    };
    this.selectHandler = this.selectHandler.bind(this);
  }

  componentDidMount() {
    if (document.getElementById("class") === null) {
      fetch(`http://localhost:8000/api/getcarlist/0`)
        .then((response) => response.json())
        .then((result) => this.setState({ cars: result, dataReturned: 1 }))
        .catch((e) => {
          console.log(e);
          this.setState({ cars: result });
        });
    }
    fetch("http://localhost:8000/api/getclasses/")
      .then((response) => response.json())
      .then((result) => this.setState({ data: result, dataReturned: 1 }))
      .catch((e) => {
        console.log(e);
        this.setState({ data: result });
      });
  }

  selectHandler = () => {
    fetch(
      `http://localhost:8000/api/getcarlist/${
        document.getElementById("class").value
      }`
    )
      .then((response) => response.json())
      .then((result) => this.setState({ cars: result, dataReturned: 1 }))
      .catch((e) => {
        console.log(e);
        this.setState({ cars: result });
      });
  };

  render() {
    if (this.state.dataReturned) {
      const carclass = this.state.data.map((d) => (
        <option key={d.ID} value={d.ID}>
          {d.CLASS}
        </option>
      ));
      const cars = this.state.cars.map((d) => (
        <div className="col-xl-4 col-lg-6 col-md-12" key={d.ID}>
          <div className="card">
            <img
              className="card-img-top"
              src={"/photos/" + d.PHOTO}
              alt="Card image cap"
            />
            <div className="card-body">
              <h5 className="card-title">{d.MODEL}</h5>
              <div className="card-text">Год выпуска: {d.YEAR}</div>
              <div className="card-text">Класс: {d.CLASS}</div>
              <div className="card-text">Стоимость: {d.COST} р./мин.</div>
              <div className="rating">
                <div className="img">
                  <img
                    className="rating-star"
                    src="/icons/Actions-rating-icon.png"
                  ></img>
                </div>
                <div className="content">{d.RATING}</div>
              </div>
              <a
                href={"/rent/" + d.ID + "/" + this.props.id_user}
                className="btn btn-primary"
              >
                Арендовать
              </a>
            </div>
          </div>
        </div>
      ));

      return (
        <div>
          <select
            id="class"
            name="class"
            class="form-select"
            onChange={() => this.selectHandler()}
          >
            <option key="0" value="0">
              Все
            </option>
            {carclass}
          </select>
          <div className="row">{cars}</div>
        </div>
      );
    } else return "Ничего не найдено";
  }
}
