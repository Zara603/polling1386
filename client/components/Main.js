import React from 'react'
import ReactDOM from 'react-dom'
import loadGoogleMapsAPI from 'load-google-maps-api'
import 'semantic-ui-css/semantic.css'
import jQuery from 'jquery'
window.jQuery = jQuery
require('semantic-ui-css/semantic')
import List from './List'
import InfoWindow from './InfoWindow'
import branches from '../data/branches'

class Main extends React.Component {
  render() {
    return (
      <div className="root">
        <div className="hero">
          <img src="public/images/iran-hope.png"/>
          <div className="title-persian">
            <p >
              To find the nearest polling station enter your address into the box below.
            </p>
            <p className="warning">
              * You will need your passport in order to vote.
            </p>
          </div>

        </div>
        <div className="ui top attached menu">
          <div className="item">
            <a href="/">
              <img className="ui mini image" src="public/images/site_logo.png"/>
            </a>
          </div>
          <div className="search item">
            <div className="ui big transparent left icon input">
              <input ref="search" type="text" placeholder="Where can I vote" onKeyUp={(e) => this.search(e)}/>
              <i className="search link icon"></i>
            </div>
            <div className="results"></div>
          </div>
        </div>
        <div className="ui bottom attached segment">
          <div className="ui stackable grid">
            <div className="row">
              <div ref="infoPanel" className="left five wide column">
                <List {...this.props} map={this.map}/>
              </div>
              <div className="right eleven wide column">
                <div ref="map" className="map-canvas"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    loadGoogleMapsAPI({
      key: 'AIzaSyA7U_W-DipuiGaONpCHJiCxTF9-plPU4o4',
      v: '3',
      libraries: ['places', 'geometry']
    }).then(gmaps => {
      this.map = new gmaps.Map(ReactDOM.findDOMNode(this.refs.map), {
        center: new gmaps.LatLng(-34.397, 150.644),
        zoom: 4,
        styles: this.setMapStyle()
      })
      this.locateMe()
      this.loadData()
      this.bounds = new gmaps.LatLngBounds(
        new gmaps.LatLng(-34.397, 150.644),
        new gmaps.LatLng(-34.397, 150.644)
      )
      const search = new gmaps.places.Autocomplete(
        ReactDOM.findDOMNode(this.refs.search),
        {bounds: this.bounds}
      )
      gmaps.event.addListener(this.map, 'bounds_changed', () => this.updateListFromExtent())
    })
  }

  setMapStyle() {
    return [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#691969"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"##685a7a"},{"weight":6}]},{"featureType":"landscape","elementType":"all","stylers":[{"lightness":20},{"color":"#f9f9f9"}]},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#f2ede5"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"hue":"#11ff00"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#4cff00"},{"saturation":58}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#f2ede5"},{"lightness":-25}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#f2ede5"},{"lightness":-40}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#f2ede5"},{"lightness":-10}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#f2ede5"},{"lightness":-20}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#A8CFF3"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":100}]}]
  }

  loadData() {
      branches.features.map((feature, i) => {
        const coords = feature.geometry.coordinates
        const pos = new google.maps.LatLng(coords[0], coords[1])
        const marker = new google.maps.Marker({
          animation: 'DROP',
          position: pos,
          map: this.map,
          icon: {
            url: 'public/images/pas.png'
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: feature.properties.branch,
          position: pos,
          pixelOffset: new google.maps.Size(0, -25)
        });
        marker.addListener('click', () => {
          infoWindow.open(this.map)
        });
      });
      //this.addPopup()
  }

  updateListFromExtent() {
    const extent = this.map.getBounds()
    const branchList = branches.features.filter(feature => {
      const coords = feature.geometry.coordinates
      return extent.contains(new google.maps.LatLng(coords[0], coords[1]))
    })
    this.props.updateListFromExtent(branchList)
  }

  search(e) {
    if (e.key === 'Enter') {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({
        address: e.target.value,
        bounds: this.bounds
      }, (results, status) => this.listNearBy(results, status))
    }
  }

  listNearBy(results, status) {
    if (status === 'OK') {
      const originLat = results[0].geometry.location.lat();
      const originLong = results[0].geometry.location.lng();

      const origin = new google.maps.LatLng(originLat, originLong);
      const distanceIndex = branches.features.map((feature, i) => {
        const coords = feature.geometry.coordinates
        const destination = new google.maps.LatLng(coords[0], coords[1])
        const distance = google.maps.geometry.spherical.computeDistanceBetween(origin, destination)
        console.log(originLat, originLong, feature.properties.branch, coords[0], coords[1], distance)
        return {
          distance: distance,
          index: i
        }
      })
      const sortedDistanceIndex = distanceIndex.sort((a, b) => {
        return a.distance - b.distance
      })
      console.log(sortedDistanceIndex)
      const bounds = new google.maps.LatLngBounds()
      sortedDistanceIndex.slice(0, 2)
        .forEach(x => {
          let coords = branches.features[x.index].geometry.coordinates
          bounds.extend(new google.maps.LatLng(coords[0], coords[1]))
        })
      this.map.fitBounds(bounds)
    }
  }

  locateMe() {
    setTimeout(() => {
      const pos = new google.maps.LatLng(-34.397, 150.644)
      this.map.setCenter(pos)
      const locationInfoWindow = new google.maps.InfoWindow({
        content: 'You are here.',
        position: pos,
        pixelOffset: new google.maps.Size(0, -25)
      })
      const marker = new google.maps.Marker({
        animation: 'DROP',
        position: pos,
        map: this.map,
        icon: {
          url: 'public/images/star.png'
        }
      })
      locationInfoWindow.open(this.map)
      marker.addListener('click', () => {
        locationInfoWindow.open(this.map)
      })
    } , 2000)
  }

  addPopup() {

    this.infoWindow = new google.maps.InfoWindow()
    this.map.data.addListener('click', (event) => {
      console.log('jon jon', event)
      const {feature} = event
      const point = feature.getGeometry().get()
      const content = document.createElement('div')
      ReactDOM.render(<InfoWindow feature={feature} {...this.props} />, content)
      this.infoWindow.setContent(content)
      this.infoWindow.setPosition(point)
      this.infoWindow.open(this.map)
    })
  }

  componentDidUpdate() {
    if (this.props.currentListItem.properties) {
      const $container =jQuery(ReactDOM.findDOMNode(this.refs.infoPanel))
      $container.animate({
        scrollTop: 0
      }, 200)
    }
  }
}

export default Main