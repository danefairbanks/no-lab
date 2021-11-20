using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Speech.Synthesis;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace localtts.net
{
    class Program
    {
        static void Main(string[] args)
        {
            var hs = new HttpServer();
            hs.RequestReceived += OnRequestReceived;
            hs.Start("http://localhost:1337/");

            Console.ReadKey();
        }

        static void OnRequestReceived(object sender, HttpServer.RequestReceivedArgs e)
        {
            HttpListenerRequest request = e.Context.Request;
            // Obtain a response object.
            HttpListenerResponse response = e.Context.Response;

            if (!string.IsNullOrWhiteSpace(request.QueryString["value"]))
            {
                var synthesizer = new SpeechSynthesizer();
                synthesizer.SelectVoice("Microsoft Zira Desktop");
                synthesizer.SetOutputToDefaultAudioDevice();
                synthesizer.Speak(request.QueryString["value"]);
            }

            // Construct a response.
            string responseString = "<HTML><BODY>TTS</BODY></HTML>";

            byte[] buffer = System.Text.Encoding.UTF8.GetBytes(responseString);
            // Get a response stream and write the response to it.
            response.ContentLength64 = buffer.Length;
            response.AddHeader("Access-Control-Allow-Origin", "*");
            System.IO.Stream output = response.OutputStream;
            output.Write(buffer, 0, buffer.Length);
            // You must close the output stream.
            output.Close();
        }
    }
}
