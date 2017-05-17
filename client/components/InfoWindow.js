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
        </div>
        <div className="content">
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