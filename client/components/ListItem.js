import React from 'react'

class ListItem extends React.Component {
  render() {
    this.branch = this.props.branch
    const attrs = this.branch.properties
    this.map = this.props.map
    return (
      <div ref="container" className="item branch"
           onMouseOver={() => this.mouseOver()}
           onMouseOut={() => this.mouseOut()}>
        <div className="content details">
          <a className="heading" href={'#/' + attrs.branch}>{attrs.branch}</a>
          <div className="description">
            <i className="call icon"></i>
            <span>{attrs.office_phone || 'N/A'}</span>
          </div>
          <div className="description">
            <i className="flag icon"></i>
            <span>{attrs.street_address}</span><br />
            <i className="icon"></i>
            <span>{attrs.city}, {attrs.state} {attrs.zip}</span>
          </div>
        </div>
        <div className="content operations">
          <div className="ui basic button"
               onClick={() => this.showDirectionsPanel(this.branch)}>
            <i className="red map pin icon"></i>
            Directions
          </div>
        </div>
      </div>
    )
  }
  mouseOver() {
    const { properties } = this.branch
    if (this.map) {
        const feature = this.map.data.getFeatureById(properties.cartodb_id)
        this.map.data.overrideStyle(feature, {
          icon: {
            url: 'public/images/blue-pin.png'
          },
          zIndex: 1000
        })
    }
  }
  mouseOut() {
    if (this.map) {
      this.map.data.revertStyle()
    }
  }

  showDirectionsPanel(branch) {
    this.props.selectListItem(branch)
  }

  setBranch() {
    localStorage.setItem('branch', JSON.stringify(this.branch))
    this.props.setMyBranch(this.branch)
  }

}
export default ListItem