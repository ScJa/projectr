from collections import OrderedDict

#http://scikit-learn.org/stable/auto_examples/cluster/plot_dbscan.html#example-cluster-plot-dbscan-py

import numpy as np

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.cluster import DBSCAN
from sklearn import metrics

data = OrderedDict({
  "22688213_813cc7": ["Java EE", "PHP", "HTML", "JavaScript", "Scrum", "Apache", "[testdata]"],
  "20809901_692c5d": ["Softwareentwicklung", "Android", "Google", "G1", "Adobe Flex", "Java", "Lucene", "Perl", "CPAN", "Web-Frameworks", "Catalyst", "Plack", "Template Toolkit", "MySQL", "fehlertolerante Suche", "Internet-Architekturen", "Skalierung / Skalierbarkeit", "Optimierung", "[test]"],
  "20217626_f30f1c": ["Organisationstalent", "Engagement", "Verantwortungsbewusstesein und Sorgfalt", "\u00dcberzeugungs- und Kommunikationsst\u00e4rke", "[test]"],
  "20474532_6e6ef4": ["Java EE", "PHP", "HTML", "JavaScript", "Scrum", "Apache", "[testdata]"],
  "21464113_061d62": ["Organisationstalent", "Engagement", "Verantwortungsbewusstesein und Sorgfalt", "\u00dcberzeugungs- und Kommunikationsst\u00e4rke", "[test]"],
  "4454252_85469f": ["Java EE", "PHP", "HTML", "JavaScript", "Scrum", "Apache", "[testdata]"],
  "12309958_e03f41": ["Softwareentwicklung", "Android", "Google", "G1", "Adobe Flex", "Java", "Lucene", "Perl", "CPAN", "Web-Frameworks", "Catalyst", "Plack", "Template Toolkit", "MySQL", "fehlertolerante Suche", "Internet-Architekturen", "Skalierung / Skalierbarkeit", "Optimierung", "[test]"],
  "18751666_c78344": ["Webdesign", "Webentwicklung", "Webstandards", "Frontend", "Grafikdesign", "Photoshop", "Illustrator", "Screendesign", "Barrierefreiheit", "Usability", "HTML5", "XHTML", "XML", "CSS", "CSS3", "JavaScript", "jQuery", "PHP", "SEO", "[test]"],
  "20361869_1ad9f0": ["Organisationstalent", "Engagement", "Verantwortungsbewusstesein und Sorgfalt", "\u00dcberzeugungs- und Kommunikationsst\u00e4rke", "[test]"],
  "14329445_0d6b04": ["Softwareentwicklung", "Android", "Google", "G1", "Adobe Flex", "Java", "Lucene", "Perl", "CPAN", "Web-Frameworks", "Catalyst", "Plack", "Template Toolkit", "MySQL", "fehlertolerante Suche", "Internet-Architekturen", "Skalierung / Skalierbarkeit", "Optimierung", "[test]"],
  "20078818_f41d20": ["Webdesign", "Webentwicklung", "Webstandards", "Frontend", "Grafikdesign", "Photoshop", "Illustrator", "Screendesign", "Barrierefreiheit", "Usability", "HTML5", "XHTML", "XML", "CSS", "CSS3", "JavaScript", "jQuery", "PHP", "SEO", "[test]"]
})

corpus = ["; ".join(value) for _, value in data.items()]

vectorizer = CountVectorizer(min_df=1)
X = vectorizer.fit_transform(corpus)

db = DBSCAN(min_samples=5).fit(X)
core_samples_mask = np.zeros_like(db.labels_, dtype=bool)
core_samples_mask[db.core_sample_indices_] = True
labels = db.labels_
print(labels)