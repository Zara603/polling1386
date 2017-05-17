import React from 'react'

class InfoWindow extends React.Component {
  render() {
    const {feature} = this.props
    return (
      <div className="ui card">
        <div className="content">
          <div className="header">{feature.properties.branch}</div>
        </div>
        <div className="content">
          <div className="description">
            <i className="flag icon"></i>
            {feature.properties.street_address}<br />
            <i className="icon"></i>
            {feature.properties.city}, {feature.properties.state} {feature.properties.zip}
          </div>
          <div className={feature.properties.br_group === 'PAS' ? 'description transition hidden' : 'description' }>
            <i className="call icon"></i>
            <span>{feature.properties.office_phone}</span>
          </div>
          <br />
          <div className={feature.properties.br_group === 'PAS' ? 'transition hidden' : '' }>
            <div className="description">
              <strong>Monday:</strong> {feature.properties.monday_open} AM - {feature.properties.monday_close} PM
            </div>
            <div className="description">
              <strong>Tuesday:</strong> {feature.properties.tuesday_open} AM - {feature.properties.tuesday_close} PM
            </div>
            <div className="description">
              <strong>Wednesday:</strong> {feature.properties.wednesday_open} AM - {feature.properties.wednesday_close} PM
            </div>
            <div className="description">
              <strong>Thursday:</strong> {feature.properties.thursday_open} AM - {feature.properties.thursday_close} PM
            </div>
            <div className="description">
              <strong>Friday:</strong> {feature.properties.friday_open} AM - {feature.properties.friday_close} PM
            </div>
          </div>

        </div>
        <div className="content">
          <a href={'#/' + feature.properties.branch} className="ui button">
            <i className="external icon"></i>Details
          </a>
          <button className="ui button" onClick={() => this.getDirections(feature.properties.cartodb_id)}>
            <i className="red map pin icon"></i>Directions
          </button>
        </div>
      </div>
    )
  }

  getDirections(id) {
    const branch = this.props.branches.features.filter(feature => feature.properties.cartodb_id === id)[0]
    this.props.selectListItem(branch)
  }
}

export default InfoWindow