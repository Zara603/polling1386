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
              To find the nearest polling station, enter your address into the box below.
            </p>
            <p className="warning">
              * You will need either your passport, ID or birth certificate in order to vote.
            </p>
          </div>
        </div>
        <div className="social-info">
         <span><a href="https://www.facebook.com/events/1824977051156851/"><i className="facebook icon"></i></a></span>
         <span><a href="https://t.me/iran_hope"><i className="telegram icon"></i></a></span>
         <span><a href="https://twitter.com/IRAN_HOPE_96"><i className="twitter icon"></i></a></span>
         <span><a href="mailto:IRAN.HOPE.96@GMAIL.COM"><i className="mail icon"></i></a></span>
        </div>
        <div className="credit">
          <p>Author: Zahra D, Contributers: Mohammad, Taha, Saeed & Jon</p>
        </div>
        <div className="ui top attached menu">
          <div className="item">
            <a href="/">
              <img className="ui mini image" src="public/images/site_logo.png"/>
            </a>
          </div>
          <div className="search item">
            <div className="ui big transparent left icon input">
              <input ref="search" type="text" placeholder="Where can I vote" />
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
      key: 'AIzaSyDX_h_hKHV2-GcAP1GPtqS4P0XscCsKszg',
      v: '3',
      libraries: ['places', 'geometry']
    }).then(gmaps => {
      this.map = new gmaps.Map(ReactDOM.findDOMNode(this.refs.map), {
        center: new gmaps.LatLng(-34.397, 150.644),
        zoom: 4,
        styles: this.setMapStyle()
      })
      // this.locateMe()
      this.loadData()
      this.bounds = new gmaps.LatLngBounds(
        new gmaps.LatLng(-34.397, 150.644),
        new gmaps.LatLng(-34.397, 150.644)
      )
      const search = new gmaps.places.Autocomplete(
        ReactDOM.findDOMNode(this.refs.search),
        {bounds: this.bounds}
      )

      gmaps.event.addListener(search, 'place_changed', () => {
          var place = search.getPlace();
          this.searchForPlace(place.formatted_address || place.name);
      });
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
        marker.addListener('click', () => {
          this.showInfo(feature)
        });
      });
  }

  updateListFromExtent() {
    const extent = this.map.getBounds()
    const branchList = branches.features.filter(feature => {
      const coords = feature.geometry.coordinates
      return extent.contains(new google.maps.LatLng(coords[0], coords[1]))
    })
    this.props.updateListFromExtent(branchList)
  }

  searchKeyStroke(e) {
    if (e.key === 'Enter') {
      this.searchForPlace(e.target.value);
    }
  }
  searchForPlace(place) {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({
        address: place,
        bounds: this.bounds
      }, (results, status) => this.listNearBy(results, status));
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
        return {
          distance: distance,
          index: i
        }
      })
      const sortedDistanceIndex = distanceIndex.sort((a, b) => {
        return a.distance - b.distance
      })
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

  showInfo(feature) {
      this.infoWindow = new google.maps.InfoWindow()
	  const coords = feature.geometry.coordinates
	  const point = new google.maps.LatLng(coords[0], coords[1])
	  const content = document.createElement('div')
	  ReactDOM.render(<InfoWindow feature={feature} {...this.props} />, content)
	  this.infoWindow.setContent(content)
	  this.infoWindow.setPosition(point)
	  this.infoWindow.open(this.map)
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