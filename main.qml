import QtQuick 2.4
import QtCanvas3D 1.0
import QtQuick.Window 2.2
import "glcode.js" as GLCode
import QtQuick.Controls 1.3

Window {
    id:hmiwindow
    title: qsTr("practice")
    width: 1280
    height: 768
    visible: true

    //QML controlled ThreeJS animation... pretty cool!
    property real animTime: 0
    onAnimTimeChanged: GLCode.animateMesh(animTime);

    Canvas3D {
        id: canvas3d
        anchors.fill: parent
        focus: true

        onInitializeGL: {
            GLCode.initializeGL(canvas3d);
        }

        onPaintGL: {
            GLCode.paintGL(canvas3d);
        }

        onResizeGL: {
            GLCode.resizeGL(canvas3d);
        }

        //This is our Alert button used to simulate a tire pressure problem.
        Button {
            id: button1
            x: 8
            y: 15
            text: qsTr("Alert!")
            onClicked: warn();

            function warn() {
                warningLabel.text = qsTr("Tire Pressure Very Low!");
                animtimer.running = true;
            }
        }

        //I tried to keep the animation quick, as to not distract the driver for too long.
        PropertyAnimation  {
            id:animtimer
            target:hmiwindow
            properties: "animTime"
            from: 0
            to: 1
            duration: 500
        }


        Label {
            id: warningLabel
            x: 515
            y: 58
            width: 660
            height: 59
            color: "#ff0000"
            text: qsTr("")
            horizontalAlignment: Text.AlignHCenter
            onTextChanged: coloranim.running = true;
            font.bold: true
            font.pointSize: 35

            SequentialAnimation on color{
                id:coloranim
                loops: 10

                ColorAnimation {
                    from: "red"
                    to: "black"
                    duration: 200
                }

                ColorAnimation {
                    from: "black"
                    to: "red"
                    duration: 200
                }
            }
        }
    }
}

